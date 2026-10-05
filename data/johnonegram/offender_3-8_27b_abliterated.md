# johnonegram/Offender_3.8_27B_Abliterated

## Resumen

Offender_3.8_27B_Abliterated es un modelo multimodal (imagen, vídeo y texto) de 27B parámetros publicado por el usuario johnonegram en HuggingFace, construido mediante ajuste fino continuado por etapas sobre medismera/Qwen3.8-27B-Surgical-Abliterated. Está especializado en ciberseguridad ofensiva: análisis de vulnerabilidades de corrupción de memoria, desarrollo de exploits, ingeniería inversa de binarios, seguridad en la nube y orquestación de agentes autónomos con evasión de sistemas anti-bot. La arquitectura declarada es un transformer híbrido de la familia Qwen3_5, que intercala capas de linear attention (SSM con estado recurrente) y capas de atención completa con GQA.

El modelo emplea cuantización FP8 nativa (formato F8_E4M3 con escalas por bloques de 128x128), lo que reduce el peso en disco a aproximadamente 26,9 GB y permite ejecutarlo en una única GPU de 32, 48 u 80 GB sin recurrir a cuantizaciones de 4 bits. Soporta una ventana de contexto nativa de 262.144 tokens (256K) mediante RoPE con frecuencia base 10^7 y secciones mrope [11, 11, 10]. Incluye una torre de visión de 333 capas para percepción visual.

Su rasgo distintivo es la "abliteración quirúrgica": se identifica un vector de dirección de rechazo en las activaciones del flujo residual y se resta su proyección ortogonal de las matrices de pesos de atención y feed-forward, con el objetivo declarado de eliminar rechazos en investigación de seguridad autorizada sin degradar el razonamiento. El repositorio no tiene descargas ni valoraciones, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3_5 (Qwen3_5ForConditionalGeneration): 64 capas, alternancia de 48 capas de linear attention y 16 de full attention (full_attention_interval: 4), con GQA; más torre de visión de 333 capas |
| Parametros totales | 27.356.728.560 segun safetensors del repositorio; la model card declara 26.895.998.464 parametros para el backbone de texto |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (256K) nativa; RoPE con theta = 10^7 y mrope_section [11, 11, 10] |
| Tipos de cuantizacion | FP8 nativo (F8_E4M3) con cuantizacion por bloques 128x128 y tensores weight_scale_inv; no se documentan variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | en, ar |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (shards FP8) y visual.safetensors para la torre de vision |
| Tamano del repositorio | 27,9 GB |
| Modalidades | Texto, imagen y video (pipeline image-text-to-text) |
| Fecha de publicacion | 2026-10-04 |

## Arquitectura y entrenamiento

La topologia declarada es `qwen3_5_text` (Qwen3_5ForCausalLM) en configuracion híbrida: 64 capas ocultas en las que cada cuatro capas se intercala una de atención completa con GQA, mientras que el resto emplea linear attention con estados de convolución recurrente de coste O(1) por paso de inferencia. Segun la model card, esto reduce la huella activa de la KV-cache en un 75% frente a modelos de atención densa monolítica, lo que habilita sesiones agénticas concurrentes y servir lotes grandes en VRAM limitada. El componente visual es un Vision Transformer de 333 capas almacenado en un fichero separado, orientado a capturas de interfaz, diagramas de topología de red, capturas de Wireshark, CAPTCHAs y grabaciones de pantalla.

El entrenamiento consistió en ajuste fino continuado multi-etapa sobre medismera/Qwen3.8-27B-Surgical-Abliterated. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La innovación técnica más destacada es el procedimiento de abliteración: se aísla un vector de dirección de rechazo v en el espacio de activaciones mediante perfilado de diferencia de medias sobre pares contrastivos de doble dominio, y cada matriz de proyección W se modifica con una resta de proyección ortogonal, W_abl = W - (v·v^T)W, en las proyecciones críticas de atención y feed-forward. El modelo se distribuye con pesos FP8 con tensores de escala inversa por tensor para dequantización en tiempo real y ejecución directa sobre arquitecturas NVIDIA Ada y Hopper mediante kernels FlashInfer.

## Capacidades

- Generación de texto conversacional y razonamiento con cadena de pensamiento (CoT) explícita.
- Visión: interpretación de capturas de interfaz, diagramas de topología de red, capturas de tráfico de red (Wireshark) y vídeo de grabación de pantalla.
- Ciberseguridad ofensiva: análisis de corrupción de memoria, temporización de heap de glibc, superficies de ataque de drivers de kernel y síntesis de gadgets ROP/JOP.
- Ingeniería inversa de binarios y análisis de bajo nivel.
- Seguridad en la nube: recorrido de grafos IAM multi-cuenta, escalada de privilegios cruzada entre AWS, GCP y Azure y análisis de confused deputy en microservicios.
- Orquestación agéntica autónoma: automatización de navegador con Playwright/Scrapling, diagnóstico de puntuaciones de anomalía de WAF, suplantación de huellas TLS (JA3/JA4) y autocorrección dinámica de payloads.
- Capacidades multilingües limitadas a inglés y árabe según los metadatos declarados.
- Compatibilidad declarada con motores de servicio SGLang y vLLM.
- No se documenta en la información disponible soporte explícito de tool calling o function calling, audio ni modo thinking diferenciado.

## Casos de uso

- Auditoría de corrupción de memoria en programas en C/C++: el modelo puede analizar código y trazas para localizar patrones de uso tras liberación, desbordamientos de buffer o desajustes en la gestión de arena del heap, gracias a su entrenamiento específico en esta superficie de ataque.
- Ejercicios de red team autorizados sobre binarios propietarios: análisis de gadgets ROP/JOP y construcción de cadenas de explotación en un laboratorio aislado, partiendo del binario y de su mapa de memoria.
- Revisión de configuraciones multinube: recorrido de políticas IAM en AWS, GCP y Azure para detectar rutas de escalada de privilegios entre cuentas y roles, aprovechando la ventana de 256K tokens para cargar políticas completas en una sola pasada.
- Análisis de capturas de red y diagramas de topología: la torre de visión permite alimentar el modelo con imágenes de Wireshark o esquemas de red para que correlacione tráfico y arquitectura sin necesidad de parsear manualmente los ficheros.
- Automatización de pruebas de seguridad web con agentes: orquestación de sesiones de Playwright con suplantación de huella TLS JA3/JA4 para validar defensas anti-bot y WAF en entornos propios, con autocorrección de payloads ante cambios de puntuación de anomalía.
- Generación de informes técnicos de hallazgos: transcripción de análisis de exploits y vulnerabilidades a documentación estructurada para equipos de seguridad, con contexto largo para incluir todo el histórico de una auditoría.
- Asistencia a equipos de bug bounty en la fase de triaje: análisis de capturas de pantalla y vídeo de reproducción de una vulnerabilidad para resumir vectores de ataque y pasos de reproducción antes de escalar el informe.
- Investigación en robustez de alineamiento: el modelo sirve como objeto de estudio para medir qué capacidades se preservan y cuáles se degradan tras aplicar abliteración por proyección ortogonal sobre las matrices de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso en disco de los pesos FP8: aproximadamente 26,9 GB, según la model card.
- VRAM para inferencia: los pesos FP8 caben en una GPU de 32 GB, 48 GB u 80 GB. Hay que sumar la KV-cache y las activaciones, por lo que se recomienda margen adicional. No se publican cifras concretas de VRAM total.
- GPU recomendadas: NVIDIA Hopper (H100, H200) y Ada (L40S, RTX 6000 Ada) para ejecución FP8 nativa con kernels FlashInfer. A100 (80 GB) dispone de capacidad pero sin soporte FP8 nativo de cuarta generación.
- GPU de consumo: cabe en tarjetas con 32 GB o más (por ejemplo, RTX 5090). En una RTX 4090 de 24 GB no cabría en FP8 sin una cuantización adicional, para la que no hay formato documentado en la información disponible.
- Opciones de despliegue: SGLang y vLLM están declarados como compatibles en las etiquetas del repositorio. No se documenta soporte de llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput estimados: no disponibles. La model card afirma una reducción del 75% en la huella de KV-cache activa frente a atención densa, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| johnonegram/Offender_3.8_27B_Abliterated | 27,36B segun safetensors | 256K | Texto, imagen, video | apache-2.0 | Publicado en HuggingFace, 0 descargas, 0 likes |
| medismera/Qwen3.8-27B-Surgical-Abliterated (modelo base) | 27B (no se detalla el desglose) | no disponible | no disponible | no disponible | Referenciado como base_model |
| medismera/Qwen3.8-cyber-RedTeam-Surgical-Abliterated | no disponible | 256K segun distintivos de la model card | Texto, imagen, video | apache-2.0 segun distintivos | Referenciado en los enlaces de la model card |

No se dispone en la informacion proporcionada de datos de rendimiento de terceros alternativos (por ejemplo, otros modelos de ciberseguridad ofensiva de tamano similar) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo orientado a seguridad ofensiva: incluye capacidades de desarrollo de exploits, evasión de WAF y suplantación de huellas TLS. Su uso debe limitarse a investigación autorizada y entornos controlados; el uso contra sistemas sin consentimiento explícito puede ser ilegal.
- La abliteración elimina deliberadamente los patrones de rechazo, lo que reduce las salvaguardas de seguridad del modelo base. No debe desplegarse en aplicaciones de cara al público sin capas adicionales de filtrado.
- No se han publicado benchmarks, por lo que no hay evidencia verificable del rendimiento real ni de la degradación que la abliteración pueda haber causado en tareas generales.
- Riesgo de alucinación elevado en un dominio técnico de alta precisión: direcciones de memoria, offsets, gadgets o nombres de funciones inventados pueden provocar fallos silenciosos en flujos de trabajo automatizados.
- Cobertura de idiomas declarada limitada a inglés y árabe; no se documenta soporte de castellano.
- La model card disponible está truncada, por lo que no se dispone de información completa sobre el proceso de entrenamiento, la composición del dataset ni las condiciones de uso recomendadas.
- El repositorio presenta 0 descargas y 0 likes: no hay validación por parte de la comunidad ni informes independientes de reproducibilidad.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad sobre el uso derivado.
- La discrepancia entre el recuento de parámetros de safetensors (27,36B) y el declarado en la model card (26,90B) sugiere que puede haber componentes no contabilizados en la cifra del texto, presumiblemente la torre de visión.
- La fecha de publicación del repositorio (2026-10-04) y la nomenclatura "Qwen3.8" no corresponden a una familia Qwen ampliamente establecida, lo que dificulta verificar la procedencia de los pesos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/johnonegram/Offender_3.8_27B_Abliterated
- Modelo base declarado: https://huggingface.co/medismera/Qwen3.8-27B-Surgical-Abliterated
- Modelo relacionado referenciado en los distintivos de la model card: https://huggingface.co/medismera/Qwen3.8-cyber-RedTeam-Surgical-Abliterated
- Paper, blog o repositorio adicional: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
