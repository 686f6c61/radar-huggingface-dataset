# mradermacher/GUI-Actor-Verifier-2B-GGUF

## Resumen

GUI-Actor-Verifier-2B es un modelo derivado de microsoft/GUI-Actor-Verifier-2B, publicado en formato GGUF por mradermacher para facilitar su ejecución local mediante llama.cpp y otras herramientas compatibles con este formato. Se trata de un modelo de aproximadamente 1.543 millones de parámetros (etiquetado comercialmente como "2B") orientado a la verificación de acciones en interfaces gráficas de usuario (GUI), es decir, a evaluar si una acción propuesta por un agente sobre una pantalla (clic, escritura, arrastre) es correcta dado el estado visual de la interfaz.

El modelo base fue desarrollado por Microsoft y entrenado sobre el dataset OS-Copilot/OS-Atlas-data, centrado en interacción con sistemas operativos y automatización de escritorio. La versión GGUF incluye componentes multimodales (archivos mmproj) que permiten procesar entradas visuales junto con texto, lo que es coherente con la tarea de verificación de acciones sobre capturas de pantalla.

Esta ficha describe principalmente la versión cuantizada distribuida por mradermacher, que ofrece un abanico de cuantizaciones estáticas desde Q2_K (0,8 GB) hasta f16 (3,2 GB), pensadas para despliegue en hardware modesto. La licencia MIT y el tamaño reducido hacen del modelo una opción práctica para prototipado de agentes GUI en entornos con recursos limitados, aunque la información pública disponible sobre arquitectura interna, benchmarks y detalles de entrenamiento del modelo base es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal con verificación de acciones GUI; detalles internos no publicados en la información disponible) |
| Parametros totales | 1.543.288.832 (aprox. 1,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; componentes multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); existen cuantizaciones imatrix en mradermacher/GUI-Actor-Verifier-2B-i1-GGUF |
| Modelo base | microsoft/GUI-Actor-Verifier-2B |
| Dataset de entrenamiento (base) | OS-Copilot/OS-Atlas-data |
| Librería declarada | transformers |
| Tamaño del repositorio | 16,2 GB |
| Descargas | 286 |
| Likes | 1 |
| Fecha de creación | 2025-06-04 |
| Última actualización | 2026-11-22 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base microsoft/GUI-Actor-Verifier-2B en la documentación proporcionada. Por el nombre, el propósito y la presencia de archivos mmproj (proyección multimodal) en la distribución GGUF, cabe inferir que se trata de un modelo multimodal que combina un codificador visual con un modelo de lenguaje para procesar capturas de pantalla junto con instrucciones textuales, pero esta inferencia no está confirmada por datos publicados en la información disponible.

El modelo base fue entrenado sobre OS-Copilot/OS-Atlas-data, un dataset orientado a tareas de interacción con sistemas operativos y automatización de escritorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La versión distribuida por mradermacher es una cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) del modelo original en transformers, sin modificaciones adicionales más allá del proceso de conversión y cuantización a GGUF.

## Capacidades

- Verificación de acciones GUI: el modelo está diseñado para evaluar si una acción propuesta por un agente (clic, escritura, arrastre, etc.) es correcta dado el estado visual de una interfaz, actuando como verificador en pipelines de agentes.
- Procesamiento multimodal: la distribución incluye archivos mmproj que permiten combinar entradas visuales (capturas de pantalla) con texto, requisito habitual para tareas de interacción GUI.
- Generación de texto conversacional: la model card indica la etiqueta "conversational", por lo que soporta diálogo multi-turno.
- Integración con llama.cpp y ecosistema GGUF: compatible con herramientas que consumen GGUF, incluyendo endpoints compatibles (tag "endpoints_compatible").
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking / razonamiento extendido: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Verificación de agentes GUI en automatización de escritorio: el modelo puede actuar como segundo paso de validación en un pipeline donde un agente propone una acción sobre una aplicación (por ejemplo, pulsar un botón de guardado) y el verificador confirma si la acción es coherente con la captura de pantalla actual, reduciendo clics erróneos en flujos RPA.
- Control de calidad en pruebas de interfaz automatizadas: integrado en suites de test de UI, el modelo puede comprobar si la acción simulada por el framework de testing produce el efecto esperado sobre la representación visual, complementando aserciones tradicionales basadas en selectores.
- Filtrado de acciones en asistentes de accesibilidad: en herramientas que asisten a usuarios con discapacidad visual mediante descripción y automatización de pantalla, el verificador puede descartar acciones ambiguas o peligrosas antes de ejecutarlas.
- Prototipado local de agentes OS-Copilot: gracias a las cuantizaciones Q4_K_M (1,1 GB) y Q5_K_M (1,2 GB), el modelo puede ejecutarse en portátiles con GPU de gama media o incluso en CPU, permitiendo iterar sobre lógica de agentes sin depender de infraestructura en la nube.
- Validación en pipelines CI/CD de agentes GUI: el modelo puede incorporarse como etapa de verificación en integración continua para comprobar que cambios en la interfaz de una aplicación no rompen las acciones esperadas por los agentes automatizados.
- Evaluación de trayectorias de agentes en investigación: investigadores que estudian fiabilidad de agentes GUI pueden usar el verificador para etiquetar automáticamente acciones correctas e incorrectas en grandes conjuntos de trayectorias, con coste de inferencia bajo gracias al tamaño de 1,54 B parámetros.
- Despliegue en entornos con restricciones de licencia: al estar bajo licencia MIT, puede integrarse en productos comerciales sin las restricciones de licencias copyleft, siempre que se respeten las atribuciones habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~0,8 GB; Q3_K_M ~0,9 GB; Q4_K_M ~1,1 GB; Q5_K_M ~1,2 GB; Q6_K ~1,4 GB; Q8_0 ~1,7 GB; f16 ~3,2 GB. Añadir aproximadamente 0,8 GB (mmproj-Q8_0) o 1,4 GB (mmproj-f16) si se utiliza la entrada multimodal.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede ejecutar las cuantizaciones Q4/Q5; para f16 se recomienda al menos 6 GB de VRAM. En entornos de servidor, GPU como A100, H100, L40S o RTX 4090 pueden alojar múltiples instancias del modelo en paralelo gracias a su reducido tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 4 GB en adelante) usando cuantizaciones Q4_K_M o Q5_K_M; también en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con endpoints (tag "endpoints_compatible"). No se documenta soporte específico para vLLM o TGI en la información disponible, ya que estos suelen requerir pesos en safetensors; para ello habría que usar el modelo base microsoft/GUI-Actor-Verifier-2B.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de verificación de acciones GUI en la documentación proporcionada. Se indica "no disponible" para evitar inventar datos. Como referencia contextual, el propio modelo base microsoft/GUI-Actor-Verifier-2B (en safetensors, licencia MIT) es la alternativa natural para despliegues que requieran transformers, vLLM o TGI en lugar de GGUF, y las cuantizaciones imatrix de mradermacher (GUI-Actor-Verifier-2B-i1-GGUF) ofrecen una alternativa de mayor calidad por tamaño similar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al entrenarse sobre OS-Atlas-data, podría heredar sesgos de las interfaces y sistemas operativos representados en ese dataset.
- Riesgo de alucinación: no se documenta explícitamente, pero al ser un modelo de verificación, falsos positivos (aceptar acciones incorrectas) son un riesgo operativo relevante en producción.
- Limitaciones de contexto o idioma: el repositorio declara únicamente inglés; no se especifica la longitud de contexto, por lo que no se puede garantizar el manejo de historiales largos de interacción.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial; se recomienda conservar el aviso de copyright original del modelo base y del cuantizador.
- Caveat para producción: la información pública sobre arquitectura, benchmarks y comportamiento del modelo base es muy escasa; se recomienda evaluar empíricamente la tasa de falsos positivos y negativos en el dominio de aplicación antes de desplegarlo como verificador crítico.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar la calidad de verificación; para uso en producción se recomienda Q4_K_M o superior, y valorar las cuantizaciones imatrix.
- El tamaño del repositorio (16,2 GB) incluye todas las cuantizaciones; descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face (versión GGUF): https://huggingface.co/mradermacher/GUI-Actor-Verifier-2B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/microsoft/GUI-Actor-Verifier-2B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/GUI-Actor-Verifier-2B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#GUI-Actor-Verifier-2B-GGUF
- Dataset de entrenamiento (base): https://huggingface.co/datasets/OS-Copilot/OS-Atlas-data
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
