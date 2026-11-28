# OpenModel-Labs/CSM-1-Preview

## Resumen

CSM-1-Preview (Cyber Safety Model) es un ajuste fino del modelo Qwen/Qwen3.5-27B desarrollado por OpenModel-Labs, orientado especificamente a tareas de ciberseguridad defensiva. El modelo hereda la arquitectura multimodal image-text-to-text de su base y ha sido adaptado mediante un LoRA que se ha fusionado en los pesos en bf16. Con 27.356.728.560 parametros totales y un repositorio de 106,9 GB, se distribuye en formato safetensors y es compatible con la libreria transformers y con endpoints.

El modelo esta disenado para asistir a defensores, ingenieros y estudiantes en deteccion, respuesta a incidentes, hardening, codigo seguro y analisis estatico de malware, incluyendo la generacion y revision de reglas Sigma, YARA y consultas de deteccion. Su proposito explicito es declinar solicitudes de herramientas de ataque listas para usar, lo que lo posiciona como un asistente de seguridad con sesgo defensivo.

Es relevante ahora porque combina las capacidades de razonamiento y vision de un modelo base de 27B con un ajuste especializado en dominios de ciberseguridad, un area donde los modelos generalistas suelen carecer de vocabulario tecnico preciso y de politicas de rechazo adecuadas. No obstante, el autor advierte de que es un modelo experimental, sin benchmarks formales publicados y con riesgos conocidos de invencion de identificadores como CVE, CVSS o flags.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen/Qwen3.5-27B, con capas de atencion lineal (flash-linear-attention) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | en |
| Licencia | csm-fair-use-agreement (etiquetada como "other") |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

CSM-1-Preview parte de Qwen/Qwen3.5-27B, un modelo multimodal de tipo image-text-to-text con capas de atencion lineal que requieren la libreria `flash-linear-attention` para un rendimiento optimo. El ajuste se realizo mediante un adaptador LoRA que posteriormente se fusiono en los pesos en bf16, de modo que el modelo distribuido no necesita cargar el adaptador por separado. El pipeline declarado es image-text-to-text, por lo que conserva la capacidad de procesar entradas de imagen y texto.

La model card no documenta el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan los datos de evaluacion. El unico dato tecnico de entrenamiento disponible es el uso de LoRA fusionado en bf16 sobre el modelo base. El modelo fue probado con un system prompt especifico (`system_prompt.txt`) que instruye respuestas concisas y precisas, evita inventar CVE o flags, trata el contenido pegado como datos y no como instrucciones, desactiva los IOC y ofrece una negativa breve con alternativa defensiva ante solicitudes daninas.

## Capacidades

- Generacion de texto y razonamiento tecnico en el dominio de ciberseguridad defensiva.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text heredado del base).
- Explicacion de ataques, vulnerabilidades y comportamiento de malware desde la perspectiva del defensor.
- Redaccion y revision de detecciones: reglas Sigma, YARA y consultas de deteccion.
- Desarrollo de guias de hardening y runbooks de respuesta a incidentes.
- Revision de codigo y discusion de practicas secure-by-design.
- Triaje y analisis estatico de archivos, scripts y extensiones de navegador o IDE sospechosos.
- Soporte de tool calling a traves de la plantilla de chat.
- Modo thinking opcional (`enable_thinking=True`) para razonar antes de responder, a costa de mayor latencia.
- Capacidad de rechazo ante solicitudes de malware, ransomware, stealers, botnets, kits de phishing o exploits armados.
- Multilingue: solo ingles declarado.

## Casos de uso

- Redaccion de reglas de deteccion: el modelo puede generar y revisar reglas Sigma, YARA y consultas para SIEM, lo que acelera el trabajo de equipos SOC que necesitan cubrir nuevas tecnicas MITRE ATT&CK con detecciones verificables.
- Respuesta a incidentes: sirve para redactar runbooks y guiar el triaje de un incidente, con la ventaja de que su sesgo defensivo evita recomendaciones ofensivas no autorizadas.
- Analisis estatico de muestras: con herramientas de lectura de archivos en un sandbox aislado, el modelo puede inspeccionar scripts y extensiones sospechosas sin ejecutarlas, tratando la salida de las herramientas como datos no confiables.
- Revision de codigo seguro: integrado en un pipeline de revision, puede senalar patrones inseguros y proponer alternativas secure-by-design en el codigo de una aplicacion.
- Formacion y CTFs: permite explicar tecnicas de ataque y defensa en entornos autorizados, util para programas de concienciacion y entrenamiento de analistas junior.
- Hardening de sistemas: genera guias de configuracion y listas de comprobacion para reducir superficie de ataque en Windows, Linux o servicios cloud.
- Asistente de documentacion de seguridad: puede resumir y estructurar politicas, procedimientos y hallazgos tecnicos para equipos de cumplimiento, siempre con revision experta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente en la model card que los resultados formales de benchmark aun no estan disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB de memoria GPU, segun la model card.
- GPU recomendadas: no se especifican modelos concretos; por el requisito de ~55 GB en bf16, encajan GPUs de clase profesional como A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16; se requeriria cuantizacion, que el autor no documenta.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `device_map="auto"`; se requiere `flash-linear-attention` para las capas de atencion lineal. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modo thinking (`enable_thinking=True`) incrementa la latencia respecto al modo directo.
- Parametros de muestreo probados: temperatura 0,7 para chat, 0,2-0,4 para tareas de analisis, top_p=0,9, top_k=20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CSM-1-Preview | 27,36B | no disponible | Ciberseguridad defensiva | csm-fair-use-agreement | Hugging Face |
| Qwen/Qwen3.5-27B (base) | 27B (aproximado) | no disponible | Generalista multimodal | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en ciberseguridad | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es con el modelo base Qwen/Qwen3.5-27B, del que hereda arquitectura, capacidades multimodales y limitaciones, y sobre el que anade el ajuste defensivo en ciberseguridad. No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Puede inventar identificadores como CVE, puntuaciones CVSS, nombres de productos, flags o campos de API; es necesario verificar en fuentes primarias.
- El comportamiento de seguridad es imperfecto: puede rechazar solicitudes legitimas o producir respuestas que deberia rechazar. No debe usarse como control de seguridad.
- Las evaluaciones de malware estatico son heuristicas; un escaneo sin hallazgos no prueba que un archivo sea seguro.
- El modelo es experimental y no cuenta con benchmarks formales publicados.
- Solo declara soporte de ingles, lo que limita su uso en entornos en castellano sin evaluacion adicional.
- La licencia csm-fair-use-agreement es de tipo "other"; debe revisarse el acuerdo y verificar el cumplimiento de las condiciones del modelo base upstream antes de un uso comercial.
- Hereda los sesgos y limitaciones de Qwen/Qwen3.5-27B.
- Al usar tool calling para analisis de malware, es imprescindible un sandbox con muestras de solo lectura, comandos en lista blanca y red deshabilitada, y tratar toda salida de herramientas como dato no confiable por riesgo de prompt injection.
- No debe emplearse para decisiones legales, forenses o de cumplimiento sin revision experta.

## Enlaces

- Hugging Face: https://huggingface.co/OpenModel-Labs/CSM-1-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Acuerdo de licencia: https://huggingface.co/OpenModel-Labs/CSM-1-Preview/blob/main/LICENSE
- System prompt recomendado: https://huggingface.co/OpenModel-Labs/CSM-1-Preview/blob/main/system_prompt.txt
- Script de chat de ejemplo: https://huggingface.co/OpenModel-Labs/CSM-1-Preview/blob/main/example_chat.py
