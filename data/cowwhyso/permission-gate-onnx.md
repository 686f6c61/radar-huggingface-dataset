# cowWhySo/permission-gate-onnx

## Resumen

`permission-gate-onnx` es un conjunto de clasificadores lineales diseñados para actuar como señal de seguridad en agentes LLM que ejecutan comandos shell. Desarrollado por el usuario cowWhySo, el modelo puntúa tres aspectos: peligrosidad de un comando, nivel de ofuscación y presencia de instrucciones inyectadas en texto. Su propósito es que un sistema de permisos decida si una acción requiere intervención humana o puede ejecutarse automáticamente, pero el propio autor advierte que debe usarse únicamente como una segunda opinión detrás de una allowlist, nunca como gate de decisión.

Técnicamente, no se trata de un transformer ni de un modelo generativo: es una regresión logística sobre n-gramas de caracteres y palabras con hashing (HashingVectorizer de scikit-learn) más un conjunto de flags léxicos. El modelo se distribuye en formato ONNX y también como pesos JSON para su uso con sklearn. Es extremadamente ligero (el repositorio ocupa 0.0 GB) y ejecuta inferencias en microsegundos en CPU, sin GPU ni conexión de red. La licencia es MIT y el idioma soportado es inglés.

La relevancia actual radica en la creciente necesidad de guardrails para agentes autónomos que interactúan con herramientas del sistema. A diferencia de soluciones basadas en LLM, este enfoque es determinista, rápido y barato, aunque con limitaciones importantes en generalización que el autor documenta con transparencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica sobre n-gramas de caracteres y palabras con hashing, mas 20 flags lexicos |
| Parametros totales | No disponible (modelo lineal pequeno, sin desglose publicado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificacion de texto, no generacion) |
| Tipos de cuantizacion | No aplica (formato ONNX, sin cuantizacion adicional) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`) y JSON (`permission_gate_weights.json`) |

## Arquitectura y entrenamiento

El modelo se compone de tres clasificadores independientes: `hazard`, `obfuscation` y `prompt_injection_watch`. Cada uno es una regresion logistica binaria que recibe como entrada una cadena de texto (un comando shell o texto arbitrario) y produce una probabilidad. Las características se generan mediante dos HashingVectorizers de scikit-learn: uno para n-gramas de caracteres (con `analyzer="char_wb"`) y otro para n-gramas de palabras, ambos normalizados L2 y con signo alternado desactivado. A estas representaciones dispersas se les añade un vector de 20 características léxicas manuales, como la presencia de `rm -rf`, `sudo`, `base64`, o el recuento de metacaracteres como `|`, `;`, `$()`. El resultado se combina en una matriz dispersa y se multiplica por los pesos de la regresión logística.

El entrenamiento se realizó con scikit-learn, pero la información disponible no detalla el dataset completo. Se menciona que el corpus de comandos contiene 246 filas, de las cuales 181 provienen de un único generador, lo que introduce un sesgo de fuente significativo. El autor también documenta un incidente técnico: en una versión inicial (etiquetada `v0-degenerate-models`), los modelos `command_hazard_model.onnx` y `obfuscation_model.onnx` devolvían puntuaciones idénticas para cualquier entrada debido a un escalado incorrecto de características y a la configuración de `alpha=1e-6` con `learning_rate="optimal"`. Este problema se corrigió en la versión actual, donde los pesos se proporcionan en `permission_gate_weights.json`. No se aplicaron técnicas como RLHF o DPO; es un entrenamiento supervisado clásico.

## Capacidades

- Clasificacion de comandos shell en "peligroso" o "no peligroso" (modelo `hazard`).
- Deteccion de ofuscacion en comandos, como uso de `base64`, `rot13` o `-encodedcommand` (modelo `obfuscation`).
- Deteccion de inyeccion de instrucciones en texto arbitrario (modelo `prompt_injection_watch`).
- Inferencia extremadamente rapida: puntuacion mediante producto escalar disperso, en microsegundos, sin GPU ni red.
- Funcionamiento sin dependencias pesadas: solo requiere scikit-learn o ONNX Runtime.
- Capacidad de integrarse como señal consultiva en un sistema de permisos para agentes LLM.

## Casos de uso

- **Guardrail en agentes LLM que ejecutan comandos shell**: el modelo puede puntuar cada comando antes de su ejecución. Si la probabilidad de peligro supera un umbral, el agente solicita confirmación humana en lugar de ejecutar automáticamente. Es adecuado porque añade una capa de seguridad sin aumentar la latencia perceptible.
- **Sistema de permisos para herramientas (tool use)**: en un entorno donde un LLM invoca herramientas como `curl`, `rm` o `git`, el modelo actúa como una denylist aprendida que solo puede mover la decisión hacia "preguntar", nunca hacia "ejecutar". Esto complementa una allowlist estática.
- **Deteccion de inyeccion de prompts**: al analizar entradas de usuario o contenido externo, el modelo `prompt_injection_watch` puede señalar si el texto contiene instrucciones inyectadas, útil en chatbots o asistentes que procesan datos no confiables.
- **Segunda opinion en pipelines de seguridad**: como componente de un sistema de auditoría, el modelo puede marcar comandos sospechosos para revisión manual, reduciendo la carga de los analistas.
- **Filtrado en entornos CI/CD**: antes de ejecutar scripts de despliegue o pruebas, el modelo puede alertar sobre comandos potencialmente destructivos, aunque siempre sujeto a una allowlist previa.
- **Educacion y concienciacion**: sirve como herramienta didáctica para demostrar cómo un clasificador lineal puede detectar patrones de comandos maliciosos, mostrando sus límites en generalización.

## Benchmarks y rendimiento

El autor reporta métricas de ROC AUC medidas el 30 de agosto de 2026, tanto en distribución como fuera de distribución (held-out por fuente). No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que el modelo no es generativo.

| Modelo | ROC AUC (in-distribution) | ROC AUC (held-out por fuente) |
|---|---|---|
| `hazard` | 0.9972 | 0.7010 |
| `obfuscation` | 0.9774 | No medido |
| `prompt_injection_watch` | 0.9807 | 0.5304, 0.4796, 0.5709 (tres fuentes) |

Además, el autor evaluó el modelo `hazard` contra un motor de permisos real que auto-aprueba solo comandos simples de lectura y compilación conocidos. El resultado fue que el modelo no añadió ningún verdadero positivo (la allowlist ya bloqueaba todos los intentos de evasión) y produjo entre uno y tres falsos positivos en cada umbral. Esto refuerza la recomendación de usarlo solo como señal consultiva.

## Requisitos de hardware

- **VRAM**: no requiere GPU; inferencia en CPU pura.
- **RAM**: mínima, el modelo es un conjunto de vectores de pesos y configuraciones de vectorizador, del orden de kilobytes.
- **GPU recomendadas**: ninguna.
- **Compatibilidad con hardware de consumo**: sí, cualquier CPU moderna es suficiente.
- **Opciones de despliegue**: ONNX Runtime, scikit-learn (cargando los pesos JSON), o cualquier runtime que soporte operaciones de producto escalar disperso.
- **Latencia**: microsegundos por inferencia, según el autor. Throughput no cuantificado, pero al ser un producto escalar disperso, es prácticamente ilimitado en uso normal.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de guardrail para agentes LLM en la información proporcionada. Las alternativas típicas serían clasificadores basados en LLM (por ejemplo, usar GPT-4 para evaluar comandos) o sistemas de reglas estáticas. Sin embargo, no hay datos numéricos para una comparación justa. Se indica "no disponible" para evitar especulaciones.

## Limitaciones y advertencias

- **No debe usarse como gate de decisión**: el autor es explícito: el modelo solo puede añadir fricción (mover hacia "ask"), nunca quitarla. Un comando con baja probabilidad de peligro no debe auto-ejecutarse si no está en la allowlist.
- **Bajo rendimiento fuera de distribución**: las métricas held-out son significativamente inferiores a las in-distribution (por ejemplo, 0.7010 vs 0.9972 en `hazard`), lo que indica que el modelo no generaliza bien a comandos de fuentes no vistas.
- **Sesgo por fuente de datos**: 181 de 246 comandos de entrenamiento provienen de un solo generador, por lo que el modelo puede estar aprendiendo el estilo de ese generador en lugar de patrones generales de peligrosidad.
- **Riesgo de falsos positivos y negativos**: en la evaluación con un motor de permisos real, el modelo produjo falsos positivos en todos los umbrales y no aportó verdaderos positivos adicionales.
- **Degeneración en versiones anteriores**: la versión `v0-degenerate-models` contenía modelos que devolvían puntuaciones idénticas para cualquier entrada. La versión actual está corregida, pero es importante verificar la procedencia de los archivos.
- **Solo inglés**: el modelo está entrenado y pensado para comandos en inglés; su comportamiento con otros idiomas no está documentado.
- **No es un sustituto de una allowlist**: la seguridad real depende de una lista blanca de comandos permitidos; el modelo es un complemento, no una solución completa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cowWhySo/permission-gate-onnx
- ONNX Model Zoo (referencia general): https://github.com/onnx/models
- Modelos ONNX en ONNX Runtime: https://onnxruntime.ai/models
- Colección de modelos ONNX de Kornia: https://huggingface.co/kornia/ONNX_models
- ONNX Model Zoo con datos (xetdata): https://github.com/xetdata/onnx-models

No se han encontrado papers, blogs o demos específicos del modelo más allá de la model card.
