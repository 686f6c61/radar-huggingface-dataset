# jsbaicenter/JSBAI-Coder-4B

## Resumen

JSBAI-Coder-4B es un modelo de 4.205.751.296 parámetros (aproximadamente 4,2B) especializado en codificación agéntica, desarrollado por el James Silberrad Brown Center for Artificial Intelligence (JSBCAI), un centro de investigación interdisciplinar de la San Diego State University. Se trata de un ajuste fino del modelo base Qwen3.5-4B y su propuesta central es ejecutar bucles de agente de codificación —explorar un repositorio, leer código, escribir un parche y ejecutar la suite de tests para verificar la corrección— en hardware de consumo, algo que según los autores requería hasta ahora modelos de 27B parámetros o más.

El modelo se distribuye bajo licencia Apache-2.0, en formato safetensors, con la etiqueta de arquitectura `qwen3_5_text` y pipeline de `text-generation`. El repositorio ocupa 8,7 GB y la model card documenta un consumo aproximado de 8 GB de VRAM en BF16 y de 5 GB en la variante cuantizada NVFP4, lo que lo sitúa en el rango de portátiles con GPU dedicada.

Su relevancia actual radica en el método de entrenamiento: un pipeline de tres etapas que combina demostraciones destiladas de un modelo profesor de 744B parámetros (GLM-5.3) verificadas mediante ejecución real de tests, seguido de aprendizaje por refuerzo con GRPO sobre 237 problemas reales de ingeniería de software, y controles de generalización en cada frontera de etapa. Los autores reportan un salto del 10,1% al 82,9% en un conjunto reservado de 121 bugs nunca vistos durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta `qwen3_5_text`), derivada de Qwen3.5-4B; sin mezcla de expertos |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (valor configurado en el ejemplo de despliegue con vLLM de la model card; el maximo del modelo base no se especifica) |
| Tipos de cuantizacion | BF16 (aproximadamente 8 GB de VRAM); NVFP4 (aproximadamente 5 GB, cuantizado con NVIDIA ModelOpt, anunciado como "coming soon"); no se documentan variantes GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso heredado de Qwen3.5-4B, sin mezcla de expertos, identificado en los metadatos como `qwen3_5_text`. El modelo emplea la plantilla de chat de Qwen3.5 con *thinking* intercalado (razonamiento entre llamadas a herramientas), el parser de razonamiento `qwen3` en vLLM y el formato de tool calling `qwen3_coder`. La model card menciona además una cabeza de decodificación especulativa basada en MTP (*multi-token prediction*) para acelerar la inferencia, distribuida por la misma organización.

El entrenamiento consta de tres etapas. La primera consistió en demostraciones semilla: GLM-5.3, un modelo abierto de 744B parámetros de Z.AI servido localmente, generó aproximadamente 1.875 trayectorias de codificación, cada una verificada ejecutando la suite de tests real antes de aceptarla; estas demostraciones enseñaron el formato del trabajo agéntico (uso de herramientas, cuándo ejecutar tests, qué constituye una solución válida). La segunda etapa fue aprendizaje por refuerzo sobre 237 problemas de ingeniería de software seleccionados por ser parcialmente resolubles pero no fiables; se aplicaron 145 lotes de GRPO *on-policy*, reforzando únicamente las soluciones que hacían pasar los tests ocultos. La tercera etapa consistió en comprobaciones de generalización en cada frontera de etapa sobre problemas nunca vistos.

En cuanto a datos, se utilizó una porción de NVIDIA Nemotron-Post-Training-Dataset-v2 (instrucciones generales, salida estructurada y uso de herramientas), el conjunto semilla destilado de GLM-5.3 y una mezcla de conjuntos abiertos de problemas de ingeniería de software como pool de práctica para el RL. La fase de refuerzo no empleó datos estáticos: el modelo generaba intentos nuevos en cada lote y solo los resultados verificados por tests se convertían en señal de entrenamiento. Los autores afirman haber publicado su protocolo de descontaminación y que ningún problema de los benchmarks se solapa con los datos de entrenamiento.

## Capacidades

- Investigación y corrección de bugs en repositorios reales: explora el código, localiza el fallo, escribe un parche y ejecuta los tests dentro de un contenedor sandbox.
- Razonamiento intercalado entre llamadas a herramientas (*interleaved thinking*), similar al de modelos de razonamiento de mayor tamaño.
- Uso de herramientas y *function calling* mediante el formato `qwen3_coder`.
- Ejecución de comandos en terminal dentro del bucle agéntico.
- Razonamiento multi-paso orientado a tareas de ingeniería de software de extremo a extremo.
- Generación de código y edición de ficheros en proyectos existentes.
- Seguimiento de instrucciones: la model card reporta una mejora en IFEval respecto al modelo base (84,66 a 87,21).
- Despliegue en hardware de consumo: aproximadamente 8 GB de VRAM en BF16 y aproximadamente 5 GB en NVFP4.
- Capacidades conversacionales y de instrucciones generales heredadas del ajuste con Nemotron-Post-Training-Dataset-v2.
- Capacidades multilingües: no disponible.

## Casos de uso

- Corrección automática de bugs en integración continua: el modelo puede recibir un repositorio con tests fallidos, localizar la causa, proponer un parche y validarlo ejecutando la suite de tests antes de abrir una pull request.
- Agente de mantenimiento de dependencias: dado un repositorio con una actualización de librería que rompe la compilación, el modelo explora los puntos de ruptura, aplica cambios y verifica el resultado en un contenedor, encajando en el mismo bucle para el que fue entrenado.
- Asistente de desarrollo en portátil: con aproximadamente 8 GB de VRAM en BF16 permite trabajar sin conexión a servicios externos, útil en entornos con restricciones de confidencialidad del código.
- Resolución de incidencias etiquetadas en gestores de tickets: el modelo puede tomar la descripción de un bug, navegar al módulo afectado, reproducirlo y generar un parche candidato con evidencia de los tests ejecutados.
- Automatización de tareas de refactorización acotada: renombrados, extracción de funciones o migraciones de API guiadas por tests existentes que actúan como criterio de aceptación verificable.
- Generación de tests de regresión: partiendo de un módulo sin cobertura, el modelo puede escribir pruebas, ejecutarlas y corregirlas de forma iterativa hasta que pasen.
- Agente de terminal para tareas de ingeniería de software en contenedor: la model card reporta resolución de extremo a extremo en 60 tareas reales (Live-60), lo que lo hace apto para pipelines que requieren ejecución de comandos y verificación posterior.
- Evaluación comparativa interna de modelos de código en equipos de investigación: sirve como referencia de 4B parámetros al medir la relación entre tamaño y capacidad agéntica.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card. La comparación se establece frente al modelo base Qwen3.5-4B. Los valores marcados como TBD no estaban publicados en la información disponible.

| Benchmark | Qwen3.5-4B (base) | JSBAI-Coder-4B | JSBAI-Coder-4B-NVFP4 |
|---|---|---|---|
| Test de generalización (121 bugs no vistos, verificado con tests) | 10,1% | 82,9% | próximamente |
| Live-60 (60 tareas reales de ingeniería resueltas en contenedores) | 15,0% | 21,7% | próximamente |
| Seguimiento de instrucciones (IFEval) | 84,66 | 87,21 | próximamente |
| MMLU-Pro | TBD | TBD | próximamente |
| Terminal-Bench 2.1 | TBD | TBD | próximamente |

La model card indica que la puntuación de seguimiento de instrucciones mejoró respecto al modelo base, y que los autores no observaron una pérdida de calidad general a cambio de las ganancias en codificación.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB en BF16; aproximadamente 5 GB en la variante cuantizada NVFP4 (datos declarados por el autor). La cuantía de pesos en BF16 para 4,2B parámetros es coherente con esa cifra.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por el perfil de memoria, encaja en GPU de consumo con 8-12 GB de VRAM y en cualquier GPU de centro de datos (A100, H100) con holgura.
- Cabe en GPU de consumo: sí, según el autor, con aproximadamente 8 GB en BF16. No se detalla una lista de modelos.
- Opciones de despliegue: el ejemplo oficial de la model card usa vLLM (`LLM(model="jsbaicenter/JSBAI-Coder-4B", max_model_len=131072)`) con el parser de razonamiento `qwen3` y el formato de tool calling `qwen3_coder`. La librería declarada es transformers. No se documentan instrucciones para llama.cpp, Ollama, TGI ni otros motores, ni variantes GGUF.
- Latencia y throughput estimados: no disponibles. El autor menciona una cabeza de decodificación especulativa basada en MTP para acelerar la inferencia, distribuida por la misma organización, pero sin cifras.
- Parámetros de muestreo recomendados: temperatura 1.0 y top_p 0.95.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JSBAI-Coder-4B | 4,2B | 131.072 tokens en el ejemplo de despliegue | Codificación agéntica con RL verificado por tests | Apache-2.0 | HuggingFace (jsbaicenter), 0 descargas y 0 likes en la fecha de consulta |
| Qwen3.5-4B | 4B (modelo base) | no disponible | Modelo generalista de texto | Apache-2.0 | HuggingFace (Qwen) |
| Jan-Code-4B | 4B | no disponible | Codificación ligera para inferencia local rápida | no disponible | HuggingFace (janhq) y GGUF en local-ai-zone; 15.262 descargas y 70 likes en la fuente consultada |

No se dispone de datos de benchmarks comparables entre Jan-Code-4B y JSBAI-Coder-4B en la información proporcionada, por lo que no es posible comparar su rendimiento real. Jan-Code-4B está ajustado sobre Jan-v3-4B-base-instruct y se orienta a subtareas de código bien acotadas con baja latencia, mientras que JSBAI-Coder-4B se orienta explícitamente a bucles agénticos completos con verificación por tests.

## Limitaciones y advertencias

- Capacidad de conocimiento limitada por el tamaño: un modelo de 4B parámetros mantiene el conocimiento factual del modelo base; hechos poco frecuentes y razonamiento en dominios muy especializados siguen favoreciendo a modelos mayores, según reconoce el propio autor.
- Ámbito de despliegue restringido: el bucle agéntico se optimizó para entornos de contenedor en sandbox; otros contextos de despliegue no han sido probados.
- Comportamiento de seguridad heredado: las conductas de seguridad proceden del modelo base, ya que la fase de RL optimizó únicamente el paso de tests y no incluyó entrenamiento específico de seguridad. Debe revisarse la model card de Qwen3.5-4B.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de alucinación en la información disponible.
- Idiomas soportados: no disponibles; no se detalla cobertura multilingüe ni evaluación por idioma.
- Licencia: Apache-2.0, lo que permite uso comercial, modificación y redistribución, con las obligaciones habituales de la licencia (conservación de avisos y del texto de la licencia).
- Datos de benchmarks incompletos: MMLU-Pro y Terminal-Bench 2.1 figuran como TBD, y la variante NVFP4 no tiene resultados publicados, por lo que no es posible validar la degradación por cuantización.
- Madurez del ecosistema: las variantes cuantizada y de decodificación especulativa se anuncian como disponibles en la misma organización, pero no había resultados publicados en el momento de la consulta. El informe técnico que debe cubrir la metodología, las ablaciones y los resultados negativos sobre destilación con logprobs del profesor está anunciado como "coming soon".
- Adopción nula en el momento de la consulta: 0 descargas y 0 likes en HuggingFace, sin validación independiente de los resultados publicados por los autores.
- Fecha de creación del repositorio: 24 de septiembre de 2026, con última actualización el mismo día; el proyecto es muy reciente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jsbaicenter/JSBAI-Coder-4B
- Organización en HuggingFace: https://huggingface.co/jsbaicenter/models
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset NVIDIA Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Organización en GitHub del JSBCAI: https://github.com/JSBAICenter
- NVIDIA ModelOpt (herramienta de cuantización NVFP4): https://github.com/NVIDIA/Model-Optimizer
- Jan-Code-4B (modelo comparable) documentación: https://www.jan.ai/docs/desktop/jan-models/jan-code-4b
- Jan-Code-4B en HuggingFace: https://huggingface.co/janhq/Jan-code-4b
- Ficha de Jan-Code-4B con GGUF en local-ai-zone: https://local-ai-zone.github.io/models/jan-code-4b.html
- Informe técnico de JSBAI-Coder-4B: anunciado como "coming soon", sin URL disponible.
