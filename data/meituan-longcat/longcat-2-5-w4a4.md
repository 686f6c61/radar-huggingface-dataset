# meituan-longcat/LongCat-2.5-W4A4

## Resumen

LongCat-2.5-W4A4 es la variante cuantizada a 4 bits (pesos y activaciones) de LongCat-2.5, un modelo de lenguaje multimodal nativo con arquitectura Mixture-of-Experts desarrollado por el equipo LongCat de Meituan. El modelo original declara 1,6 billones de parametros totales con aproximadamente 48 mil millones activados por token, y esta disenado especificamente para tareas agenticas de horizonte largo: desarrollo sobre codebases complejas, construccion de proyectos completos, diseno creativo y tareas 3D, combinando comprension visual con codificacion agentica.

El checkpoint publicado en Hugging Face bajo el identificador `meituan-longcat/LongCat-2.5-W4A4` contiene 494.847.981.260 parametros segun los metadatos de safetensors (cifra que no coincide con los 1,6T declarados en la model card, probablemente porque el repositorio aloja solo un subconjunto de expertos o una representacion empaquetada de la cuantizacion). El repositorio ocupa 1336 GB, lo que refleja la magnitud del modelo incluso en formato de 4 bits.

Su relevancia actual radica en tres factores: es multimodal nativo (las caracteristicas visuales se convierten en tokens discretos alineados con texto en un espacio semantico compartido), incorpora RL agentico de horizonte largo con salvaguardas contra reward hacking, y emplea destilacion multi-profesor con KL sobre vocabulario completo. La licencia MIT facilita su adopcion comercial, aunque el despliegue requiere infraestructura de GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal nativo, transformer con codificacion visual discreta |
| Parametros totales | 1,6 billones declarados en model card; 494.847.981.260 en safetensors del repo W4A4 |
| Parametros activos | ~48 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A4 (pesos y activaciones a 4 bits); otras variantes no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

LongCat-2.5 es un transformer MoE con modelado visual nativo construido sobre LongCat-Next (arXiv:2603.27538). Las caracteristicas visuales a resolucion nativa se convierten en tokens discretos y se alinean conjuntamente con el texto en un espacio semantico compartido, lo que evita depender de un codificador visual separado tipo CLIP. El entrenamiento combina secuencias largas con paralelismo supernode-aware, sharding eficiente y solapamiento comunicacion-computo, logrando un 86% mas de throughput por dispositivo que la linea base DDP en tareas de SFT de secuencia larga reportadas por el autor.

El post-entrenamiento incluye RL agentico de horizonte largo sobre tareas de ingenieria reales y fallos reproducibles de agentes, con estrategias de rollout eficientes y protecciones contra reward hacking. Ademas, se aplica aprendizaje multi-profesor: profesores especializados en agentes, razonamiento e interaccion guian al modelo mediante destilacion KL sobre vocabulario completo y Tree Attention (arXiv:1909.07606). La infraestructura de RL mantiene probabilidades de log de tokens identicas bit a bit entre entrenamiento, prefill y decodificacion, y optimiza la cache KV (LSA) para casi duplicar la capacidad de decodificacion sin incrementar el TPOT en la carga probada.

## Capacidades

- Generacion de texto y razonamiento general en formato conversacional multi-turno.
- Comprension de imagenes y texto combinados (pipeline `image-text-to-text`), con modelado visual nativo a resolucion nativa.
- Codificacion agentica: resolucion de tareas de terminal, construccion de proyectos completos y trabajo sobre codebases complejas.
- Ejecucion agentica de horizonte largo con razonamiento multi-paso y seguimiento de instrucciones.
- Capacidades de diseno creativo y tareas 3D segun la model card.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque las tareas agenticas de terminal implican interaccion con herramientas.
- Capacidades multilingues: no disponible el detalle de idiomas.
- Modo thinking explicito: no disponible.

## Casos de uso

- Automatizacion de tareas de terminal y DevOps: el modelo obtiene 88,4 en Terminal Bench v2.1, por lo que puede ejecutar secuencias de comandos, diagnosticar fallos y completar tareas de administracion de sistemas en entornos controlados.
- Desarrollo sobre codebases existentes: con capacidad de horizonte largo, puede navegar repositorios grandes, localizar dependencias y proponer parches coherentes en pipelines de CI/CD asistidos.
- Construccion de proyectos completos desde cero: genera scaffolding, configuracion y codigo de multiples ficheros en una sola sesion agentica, adecuado para prototipado rapido.
- Analisis de documentacion tecnica con imagenes: al ser multimodal nativo, puede interpretar diagramas de arquitectura, capturas de pantalla de errores y esquemas junto con texto.
- Asistencia en diseno creativo y modelado 3D: la model card menciona tareas 3D y diseno creativo como dominio objetivo, util para generar descripciones, scripts de escenas o instrucciones de modelado.
- Investigacion en agentes de horizonte largo: su entrenamiento con RL agentico y salvaguardas contra reward hacking lo hace idoneo como sujeto de estudio en entornos reproducibles de evaluacion.
- Despliegue en infraestructura con aceleradores domesticos: las optimizaciones de entrenamiento e inferencia sobre aceleradores de IA domesticos (segun la model card) permiten evaluar alternativas a GPU convencionales.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (los marcados con `*` son citados de terceros; el resto son mediciones internas indicativas). No se han publicado resultados adicionales en la informacion disponible.

| Benchmark | LongCat-2.5 | LongCat-2.0 | GPT-5.6-Sol | Claude-Opus-4.8 | GLM-5.3 | DeepSeek-V4.1-Flash |
|---|---|---|---|---|---|---|
| Terminal Bench v2.1 | 88,4 | 70,8 | 88,8* | 74,6* | 88,2* | 90,6* |
| Terminal Bench v4.0 | 38,5 | 3,0 | 37,3* | 23,6* | 41,8* | 31,2* |
| Program Bench (Almost Resolved) | 25,5 | 2,5 | 23 (truncado) | no disponible | no disponible | no disponible |

Los datos de la model card para Program Bench aparecen truncados en la informacion proporcionada, por lo que no se dispone de la cifra completa de GPT-5.6-Sol ni de otros modelos. No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1336 GB en formato W4A4, por lo que la inferencia requiere agregados de memoria muy superiores a una GPU individual; no disponible un desglose exacto por GPU.
- GPU recomendadas: no disponible una lista oficial; por el volumen del checkpoint se requiere un cluster multi-nodo con GPUs de memoria alta (H100, H200 o aceleradores equivalentes).
- Cabe en GPU consumer: no. Ninguna GPU consumer (RTX 4090, 5090) dispone de memoria suficiente para este checkpoint.
- Opciones de despliegue: el modelo usa `custom_code`, por lo que requiere el codigo de modelado del repositorio; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles cifras absolutas; la model card menciona que la optimizacion de cache KV casi duplica la capacidad de decodificacion sin aumentar el TPOT en la carga probada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Terminal Bench v2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongCat-2.5-W4A4 | 1,6T totales / ~48B activos | no disponible | 88,4 | MIT | Hugging Face |
| DeepSeek-V4.1-Flash | no disponible | no disponible | 90,6* | no disponible | Hugging Face |
| GLM-5.3 | no disponible | no disponible | 88,2* | no disponible | no disponible |
| Claude-Opus-5 | no disponible | no disponible | 89,1* | propietaria | API |

La comparativa se limita a los datos publicados en la model card; no se dispone de informacion sobre parametros, contexto ni licencia de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card declara 1,6T totales, mientras que safetensors reporta 494,8B; conviene verificar la composicion real del checkpoint antes de planificar el despliegue.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo de gran escala, es esperable en tareas factuales abiertas.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas: no se detalla la cobertura linguistica, lo que impide garantizar calidad fuera del ingles o chino sin evaluacion propia.
- Contexto: la longitud de contexto no esta publicada, lo que dificulta dimensionar la cache KV y planificar cargas de horizonte largo.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo depende de `custom_code` cuyo mantenimiento y compatibilidad no estan garantizados.
- Produccion: el tamano del checkpoint (1336 GB) y la ausencia de soporte confirmado en frameworks de serving estandar elevan el coste operativo y el riesgo de integracion.
- Los benchmarks internos son indicativos y no auditados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meituan-longcat/LongCat-2.5-W4A4
- Organizacion en Hugging Face: https://huggingface.co/meituan-longcat
- Organizacion en ModelScope: https://www.modelscope.cn/organization/meituan-longcat
- Blog tecnico: https://longcat.ai/blog/longcat-2.5/
- Discord: https://discord.com/invite/jmuv5TQzKU
- X/Twitter: https://x.com/Meituan_LongCat
- Paper LongCat-Next: https://arxiv.org/abs/2603.27538
- Paper Tree Attention: https://arxiv.org/pdf/1909.07606
- Informe tecnico DeepSeek-V4.1-Flash (referencia de destilacion): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Licencia: https://huggingface.co/meituan-longcat/LongCat-2.5-W4A4/blob/main/LICENSE
