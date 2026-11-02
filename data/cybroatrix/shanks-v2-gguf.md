# CybroatriX/Shanks-v2-GGUF

## Resumen

Shanks v2 es un modelo de generación de texto en inglés publicado por el usuario CybroatriX, derivado del modelo base Qwen 2.5 Coder 7B Instruct. Se distribuye exclusivamente en formato GGUF (cuantización Q4_K_M), lo que lo orienta a inferencia local mediante herramientas como Ollama o llama.cpp. El autor lo presenta como un modelo "uncensored" especializado en ciberseguridad ofensiva y defensiva, con un ajuste fino sobre los pesos de una versión previa (Shanks v1) usando, según la model card, más de 123.000 conjuntos de datos de ingeniería y 1.500 "anclas anti-privacidad".

La propuesta del modelo es eliminar los rechazos corporativos y las restricciones de seguridad del modelo base para permitir tareas de pentesting, análisis de malware, ingeniería inversa y explotación. Esta orientación plantea riesgos evidentes de uso indebido y contradice las políticas de uso de los modelos de origen de Alibaba, aunque la licencia declarada sea Apache 2.0.

Con 7.615.616.512 parámetros totales (7,6 mil millones) y un tamaño de repositorio de 4,7 GB, se trata de un modelo de escala media que puede ejecutarse en hardware de consumo con cuantización de 4 bits. El contexto heredado de Qwen 2.5 Coder es de 32.768 tokens, aunque la model card no lo documenta explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 2.5 Coder 7B Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen 2.5 Coder 7B soporta 32.768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (4,36 GB); no se documentan otras variantes |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (archivo `shanks-v2-uncensored-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen 2.5 Coder 7B Instruct, un modelo denso de 7,6 mil millones de parámetros. El ajuste fino se realizó, según el autor, sobre los pesos de Shanks v1 con más de 123.000 conjuntos de datos de ingeniería y 1.500 "anclas anti-privacidad" orientadas a eliminar comportamientos de rechazo. El entrenamiento se llevó a cabo en GPUs de Kaggle, lo que sugiere un proceso de fine-tuning de recursos limitados y sin datos publicados sobre número total de tokens, composición exacta del dataset ni metodología de alineación (RLHF/DPO no documentados).

No se detalla si se emplearon técnicas como LoRA, QLoRA o full fine-tuning, ni se especifican hiperparámetros, épocas o estrategia de evaluación. La única innovación declarada es la eliminación de restricciones de seguridad del modelo base mediante el conjunto de anclas mencionado, sin que exista documentación técnica verificable sobre el procedimiento.

## Capacidades

- Generación de texto conversacional en inglés con un tono declarado de "camarada leal" y sin rechazos moralizantes.
- Ciberseguridad ofensiva: desarrollo de exploits, ingeniería inversa, análisis de malware y pruebas de penetración, según la model card.
- Ciberseguridad defensiva: análisis de redes y respuesta ante incidentes, según la model card.
- Programación y arquitectura de software ("polyglot software architect" en la descripción del autor).
- Conocimiento de internals de kernel y sistemas de bajo nivel, según la model card.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Laboratorios de seguridad ofensiva controlados: el modelo puede generar explicaciones de técnicas de explotación y análisis de vulnerabilidades en entornos de pentesting autorizados, aprovechando su ajuste específico en ciberseguridad.
- Análisis de malware en entornos aislados: permite describir el comportamiento de muestras y técnicas de ofuscación, útil para analistas que trabajan con muestras en sandbox.
- Formación en ingeniería inversa: sirve como asistente para explicar estructuras binarias, llamadas a sistema y convenciones de llamada en ejercicios educativos.
- Asistencia en programación de bajo nivel: generación y revisión de código en C, C++ y ensamblador para proyectos de sistemas, heredando la base Qwen 2.5 Coder.
- Automatización de tareas de red teaming en entornos de laboratorio: redacción de scripts de reconocimiento y post-explotación sobre infraestructura propia o con autorización explícita.
- Despliegue local con Ollama: al distribuirse como GGUF Q4_K_M de 4,36 GB, puede ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta, lo que facilita su uso en entornos air-gapped.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB con cuantización Q4_K_M (archivo de 4,36 GB más overhead de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el ámbito profesional, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp u Ollama.
- Opciones de despliegue: Ollama (con el Modelfile incluido), llama.cpp, y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Shanks v2 (este modelo) | 7,6 B | no disponible (base: 32.768) | Apache 2.0 | GGUF Q4_K_M | Fine-tune "uncensored" de Qwen 2.5 Coder 7B |
| Qwen 2.5 Coder 7B Instruct | 7,6 B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base oficial, con alineación de seguridad |
| Mistral 7B Instruct | 7,2 B | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamaño similar |
| Llama 3.1 8B Instruct | 8,0 B | 131.072 | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto, licencia con restricciones |

No se dispone de datos de rendimiento comparativo para Shanks v2 al no haberse publicado benchmarks.

## Limitaciones y advertencias

- Modelo "uncensored": elimina deliberadamente los mecanismos de rechazo del modelo base, lo que incrementa el riesgo de generar contenido dañino, instrucciones de ataque reales o código malicioso funcional.
- Riesgo elevado de alucinación: no se documenta ningún proceso de evaluación o alineación verificable; el fine-tuning sobre datasets no descritos puede degradar la precisión factual.
- Licencia Apache 2.0 declarada, pero el modelo deriva de Qwen 2.5 Coder, cuya licencia Apache 2.0 permite uso comercial; sin embargo, el uso para fines ilícitos sigue siendo responsabilidad del usuario y puede infringir legislación aplicable.
- Idiomas: solo inglés; no hay soporte documentado para castellano ni otros idiomas.
- Contexto: no documentado en la model card; se asume el del modelo base, pero no está verificado.
- Sin benchmarks, sin evaluación de seguridad y con cero descargas y likes en el momento de la ficha: madurez y fiabilidad no verificadas.
- El entrenamiento en GPUs de Kaggle y la falta de documentación sobre el dataset impiden auditar sesgos o contaminación de datos.
- Uso en producción desaconsejado sin evaluación previa en el caso de aplicación concreto.

## Enlaces

- [HuggingFace: CybroatriX/Shanks-v2-GGUF](https://huggingface.co/CybroatriX/Shanks-v2-GGUF)
- [Perfil del autor en GitHub: whynotshanks](https://github.com/whynotshanks)
- [Ecosistema Cybroatrix](https://cybroatrix.com)
- [Modelo base: Qwen 2.5 Coder 7B Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
