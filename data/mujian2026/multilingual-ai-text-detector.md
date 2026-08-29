# mujian2026/multilingual-ai-text-detector

## Resumen

El modelo `mujian2026/multilingual-ai-text-detector` es una conversión a formato ONNX del clasificador `bibbbu/multilingual-ai-human-detector_xlm-roberta-base`, diseñado para detectar si un texto ha sido generado por inteligencia artificial o escrito por un humano. El proyecto, desarrollado por mujian2026, empaqueta el modelo original en variantes cuantizadas (q4, q8 y fp32) para permitir la inferencia directamente en el navegador mediante Transformers.js y onnxruntime-web, sin necesidad de servidor. La clasificación es binaria: devuelve las etiquetas `human` o `ai`.

La relevancia de este modelo radica en su capacidad para ejecutar detección de texto generado por IA de forma local en el navegador, lo que preserva la privacidad de los datos al no enviar el texto a una API externa. Está pensado como una señal de cribado inicial, no como una prueba forense de autoría. La evaluación upstream reporta resultados en inglés, chino simplificado y vietnamita, con un F1 global de 0.9710 sobre 270 ejemplos de prueba. El modelo se distribuye bajo licencia MIT y el repositorio GitHub asociado documenta el proceso de conversión y cuantización de forma reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (modelo base: `bibbbu/multilingual-ai-human-detector_xlm-roberta-base`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (aprox. 181 MB), q8 (aprox. 279 MB), fp32 (aprox. 1.11 GB) |
| Idiomas soportados | Evaluados: ingles, chino simplificado, vietnamita. Experimentales: chino tradicional, japones |
| Licencia | MIT |
| Formato de pesos | ONNX (para Transformers.js y onnxruntime-web) |

## Arquitectura y entrenamiento

El modelo es una conversión ONNX de un clasificador basado en XLM-RoBERTa base, fine-tuneado para la tarea de clasificación binaria de texto (humano vs. IA). No se proporcionan detalles sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El proyecto de conversión, documentado en el repositorio GitHub, exporta el modelo a formato ONNX y aplica cuantización a 4 y 8 bits para reducir el tamaño y facilitar la inferencia en navegador. La conversión se realizó sobre la revisión `b4aa2e06d8428b4d27f2ef625267044d74b2eeb8` del modelo original.

## Capacidades

- Clasificación de texto en dos clases: `human` (texto escrito por persona) y `ai` (texto generado por IA).
- Inferencia local en navegador mediante Transformers.js y onnxruntime-web, sin necesidad de servidor.
- Soporte multilingüe: evaluado en inglés, chino simplificado y vietnamita; soporte experimental para chino tradicional y japonés.
- Privacidad: el texto se procesa localmente en el dispositivo del usuario tras la descarga de los pesos del modelo.
- No requiere GPU: puede ejecutarse en CPU mediante WebAssembly o WebGPU.
- Proporciona una puntuación de confianza, aunque no calibrada como probabilidad de autoría.

## Casos de uso

- Cribado de contenido en plataformas de escritura colaborativa: el modelo puede marcar textos que probablemente hayan sido generados por IA, ayudando a los editores a priorizar la revisión manual. Su ejecución en navegador evita enviar el contenido a servidores externos.
- Moderación de comentarios en foros o redes sociales: integrado como script de cliente, puede señalar publicaciones sospechosas de ser generadas automáticamente, reduciendo la carga de moderación humana.
- Verificación de autenticidad en blogs y publicaciones: los gestores de contenido pueden usar el modelo como primera señal para detectar artículos generados por IA antes de su publicación.
- Herramientas educativas de apoyo: los docentes pueden emplearlo como indicador preliminar de posibles entregas generadas con IA, siempre combinado con criterio humano y revisión del historial del estudiante.
- Filtrado de respuestas automáticas en chatbots: en sistemas de atención al cliente, puede distinguir entre respuestas generadas por IA y las escritas por agentes humanos, útil para auditorías de calidad.
- Pipeline de control de calidad en generación de contenido: las empresas que producen texto con IA pueden usar el detector para verificar que el resultado final no sea identificable como generado, ajustando el proceso de edición.

## Benchmarks y rendimiento

La model card upstream reporta F1 sobre 270 ejemplos de prueba (90 por idioma), comparando el detector XLM-R con un baseline de regresión logística TF-IDF:

| Idioma | F1 del detector XLM-R | F1 del baseline TF-IDF |
|---|---:|---:|
| Ingles | 0.9890 | no disponible |
| Vietnamita | 0.9783 | no disponible |
| Chino | 0.9462 | no disponible |
| Global | 0.9710 | 0.9776 |

Estos resultados son in-domain (misma distribución que el conjunto de entrenamiento) y se obtuvieron con respuestas generadas por Qwen2.5-1.5B-Instruct. No se ha evaluado el rendimiento con otros generadores como GPT, Gemini o Claude, ni con texto traducido, parafraseado o muy editado. La model card advierte que el baseline TF-IDF supera ligeramente al detector en el split reportado, por lo que se recomienda evaluar el modelo en el dominio y los generadores específicos de cada aplicación.

## Requisitos de hardware

- Inferencia en navegador: requiere un navegador moderno con soporte para WebAssembly (y opcionalmente WebGPU para aceleración).
- Memoria del navegador: la variante q4 ocupa aproximadamente 181 MB al cargarse; q8 unos 279 MB; fp32 unos 1.11 GB. Se recomienda q4 como opción por defecto y q8 como respaldo si el runtime no soporta operadores q4.
- No requiere GPU dedicada: puede ejecutarse en CPU, aunque el rendimiento depende del dispositivo. En equipos de gama media, la inferencia de un texto corto suele completarse en menos de un segundo, pero no se dispone de cifras exactas de latencia.
- Despliegue: se integra mediante la librería `@huggingface/transformers` en proyectos JavaScript. También puede usarse con onnxruntime-web directamente.
- Para uso en servidor, se puede cargar el modelo ONNX con ONNX Runtime, pero el proyecto está orientado al navegador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es una conversión de un clasificador existente (`bibbbu/multilingual-ai-human-detector_xlm-roberta-base`), por lo que su comparativa directa con otros detectores de texto IA (como GPTZero, Originality.ai o DetectGPT) no está documentada en las fuentes consultadas. Se recomienda consultar el repositorio GitHub del proyecto para posibles actualizaciones.

## Limitaciones y advertencias

- No es una prueba forense de autoría: la model card lo define explícitamente como una "señal de cribado" y advierte que no debe tratarse como prueba de que una persona usó o no IA generativa.
- Rendimiento limitado a los idiomas y generadores evaluados: solo se ha validado con inglés, chino simplificado y vietnamita, y con respuestas de Qwen2.5-1.5B-Instruct. No hay evidencia de rendimiento con GPT, Gemini, Claude, ni con texto traducido, parafraseado o muy editado.
- La puntuación de salida no es una probabilidad calibrada: el valor devuelto es una señal de confianza del modelo, no una medida estadística de la probabilidad de autoría humana o de IA.
- Riesgo de falsos positivos y negativos: como cualquier clasificador, puede errar. El baseline TF-IDF reportado supera ligeramente al modelo en el split de prueba, lo que sugiere que la tarea es difícil y que el modelo no es superior a métodos más simples en ese conjunto.
- No debe usarse como base única para decisiones académicas, laborales, legales o de moderación irreversible: la model card lo prohíbe explícitamente.
- Dependencia de la cuantización: la variante q4 requiere soporte de operadores específicos en el runtime; si no está disponible, hay que recurrir a q8 o fp32, con mayor coste de descarga y memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mujian2026/multilingual-ai-text-detector
- Repositorio GitHub: https://github.com/mujian2026/multilingual-ai-text-detector
- Modelo base: https://huggingface.co/bibbbu/multilingual-ai-human-detector_xlm-roberta-base
- Demo en línea (MyToolster): https://mytoolster.com/ai-text-detector
