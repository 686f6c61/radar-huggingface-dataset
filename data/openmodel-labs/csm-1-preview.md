# OpenModel-Labs/CSM-1-Preview

## Resumen

CSM-1-Preview (Cyber Safety Model) es un ajuste fino de Qwen/Qwen3.5-27B orientado a ciberseguridad defensiva, desarrollado por OpenModel-Labs. Se trata de un modelo multimodal de tipo image-text-to-text, con 27.356.728.560 parámetros en formato bf16, entrenado mediante LoRA y con el adaptador fusionado en los pesos finales. Su propósito es asistir a defensores, ingenieros y estudiantes en detección, respuesta a incidentes, hardening, codificación segura y análisis estático de malware, rechazando explícitamente la generación de herramientas de ataque listas para usar.

El modelo parte de la arquitectura Qwen3.5, que combina capas de atención lineal (requiere el paquete `flash-linear-attention` para un rendimiento óptimo) con atención estándar, y conserva las capacidades multimodales del modelo base. Está publicado con la licencia propietaria `csm-fair-use-agreement`, lo que condiciona su uso comercial y obliga a verificar también la licencia del modelo base.

Su relevancia actual radica en la escasez de modelos abiertos especializados en seguridad defensiva con soporte de tool calling y plantilla de chat que permite activar un modo de razonamiento (`enable_thinking`). No obstante, el propio autor lo etiqueta como experimental y no publica resultados formales de benchmarks, por lo que debe tratarse como una herramienta de apoyo sujeta a verificación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (atención lineal + atención estándar), ajustada con LoRA fusionado |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | csm-fair-use-agreement (etiqueta `other`); sujeta además a la licencia del modelo base |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-27B, un transformer multimodal de 27.356 millones de parámetros que procesa entradas de imagen y texto. La adaptación se realizó mediante ajuste fino con LoRA, cuyo adaptador se fusionó posteriormente en los pesos del modelo base en precisión bf16, dando como resultado un checkpoint único de aproximadamente 54,7 GB en el repositorio. El autor recomienda `flash-linear-attention` para acelerar las capas de atención lineal del modelo base.

No se documentan en la model card el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan los datos de evaluación. La única información disponible sobre el proceso es el método (LoRA fusionado) y el modelo base. La plantilla de chat admite tool calling y un modo de razonamiento opcional (`enable_thinking=True`), que hace que el modelo razone antes de responder a costa de mayor latencia.

## Capacidades

- Generación de texto y razonamiento técnico en el dominio de ciberseguridad defensiva.
- Explicación de ataques, vulnerabilidades y comportamiento de malware con el nivel de detalle adecuado para un defensor.
- Redacción y revisión de detecciones: reglas Sigma, YARA y consultas de búsqueda.
- Elaboración de guías de hardening y runbooks de respuesta a incidentes.
- Revisión de código seguro y asesoramiento secure-by-design.
- Triaje y análisis estático de archivos sospechosos, scripts y extensiones de navegador o IDE.
- Soporte de tool calling a través de la plantilla de chat, con recomendación explícita de ejecutar herramientas en sandbox aislado y sin red.
- Modo de razonamiento opcional (`enable_thinking`) para tareas de análisis.
- Capacidades multimodales heredadas del modelo base (entrada de imagen y texto).
- Uso educativo, CTFs y conceptos de pruebas de seguridad autorizadas.
- Rechazo deliberado de peticiones para producir malware, ransomware, stealers, botnets, kits de phishing o exploits armados.

## Casos de uso

- Redacción de reglas de detección: el modelo puede generar y revisar reglas Sigma y YARA a partir de una descripción de comportamiento sospechoso, lo que acelera el trabajo de un equipo SOC que necesite borradores que luego se validan manualmente.
- Respuesta a incidentes: sirve para construir runbooks paso a paso (contención, erradicación, recuperación) adaptados a un escenario concreto, aprovechando su entrenamiento específico en respuesta a incidentes.
- Análisis estático de malware: con herramientas de lectura de archivos conectadas mediante tool calling y ejecutadas en un sandbox de solo lectura y sin red, el modelo puede inspeccionar scripts y extensiones sospechosas y resumir indicadores, sin ejecutar nunca la muestra.
- Revisión de código seguro: integrado en un flujo de revisión de pull requests, puede señalar patrones inseguros y proponer alternativas secure-by-design en el código enviado.
- Formación y concienciación: útil para explicar a desarrolladores o equipos junior cómo funciona un ataque (por ejemplo, Kerberoasting) y qué eventos de registro permiten detectarlo, con un nivel de detalle adecuado para defensores.
- Triaje de alertas: puede clasificar y priorizar alertas describiendo qué comprobar a continuación, siempre que un analista verifique los identificadores CVE y las puntuaciones CVSS citadas.
- Preparación de CTFs y pruebas autorizadas: ayuda a diseñar escenarios y a razonar sobre técnicas de ataque en entornos controlados, manteniendo la restricción de no generar tooling operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que aún no existen resultados formales de evaluación para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 55 GB en bf16, según la model card.
- GPU recomendadas: no se especifican modelos concretos; por capacidad de memoria, encajan A100 80 GB, H100 80 GB o configuraciones multi-GPU que sumen al menos 55 GB.
- GPU de consumo: no cabe en GPU de consumo de 24 GB (RTX 4090) en bf16; requeriría cuantización, que el autor no documenta ni valida oficialmente.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `device_map="auto"`; se recomienda instalar `flash-linear-attention` para las capas de atención lineal. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El modo `enable_thinking=True` incrementa la latencia de forma explícita según el autor.
- Ajustes de muestreo probados: temperatura 0,7 para chat (0,2 a 0,4 para tareas de análisis), top_p 0,9, top_k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CSM-1-Preview | 27,36 B | no disponible | Ciberseguridad defensiva, multimodal | csm-fair-use-agreement | Hugging Face |
| Qwen/Qwen3.5-27B (base) | 27 B (aprox.) | no disponible | Propósito general, multimodal | según modelo base | Hugging Face |
| Alternativas especializadas en seguridad | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye otros modelos especializados en ciberseguridad con los que comparar parámetros, contexto o rendimiento. El único punto de referencia documentado es el modelo base Qwen3.5-27B, del que CSM-1-Preview hereda arquitectura y capacidades generales, añadiendo el ajuste específico de dominio y las restricciones de uso de la licencia propia.

## Limitaciones y advertencias

- Puede alucinar identificadores: CVE, puntuaciones CVSS, nombres de productos, flags y campos de API deben verificarse siempre contra fuentes primarias.
- El comportamiento de seguridad es imperfecto: puede rechazar peticiones legítimas y también puede ser convencido para dar respuestas que debería evitar. No debe usarse como control de seguridad.
- Los veredictos de malware obtenidos por lectura estática son heurísticos; la ausencia de evidencia en un análisis rápido no prueba que un archivo sea seguro.
- Hereda los sesgos y limitaciones del modelo base Qwen3.5-27B.
- Solo soporta inglés según la model card, lo que limita su uso en entornos en castellano sin traducción previa.
- La licencia `csm-fair-use-agreement` es propietaria y de tipo "other"; es imprescindible revisar sus términos y verificar el cumplimiento de la licencia del modelo base antes de cualquier uso comercial.
- El modelo está marcado como experimental y no dispone de benchmarks publicados; no debe ser la única base para decisiones legales, forenses o de cumplimiento.
- Al usar tool calling, todas las salidas de las herramientas deben tratarse como datos no confiables, ya que pueden contener inyección de prompts; las muestras nunca deben ejecutarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenModel-Labs/CSM-1-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia (referenciada en la model card): LICENSE del repositorio de Hugging Face
- Script de chat de ejemplo: `example_chat.py` en el repositorio
- Prompt de sistema recomendado: `system_prompt.txt` en el repositorio
