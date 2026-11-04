# FlagRelease/Xing4.0-29B-A4B-BF16-ascend-FlagOS

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd., presentado como la nueva generación de la familia Xingchen (construido sobre la serie TeleChat1-3). Está diseñado específicamente para escenarios de agentes de IA: tareas de horizonte largo, planificación multietapa, invocación de herramientas y cadenas de razonamiento complejas. Esta ficha concreta corresponde a la variante publicada por la comunidad FlagOS, adaptada al hardware Ascend de Huawei en precisión BF16.

El modelo declara 29B de parámetros totales con solo 4B activos por token, lo que lo sitúa en una franja de eficiencia computacional interesante: capacidad de un modelo de decenas de miles de millones con coste de inferencia cercano a un 4B denso. Incorpora una arquitectura denominada mHC+MLA+MTP, soporta de forma nativa una ventana de contexto de 256K tokens (extensible a 512K) y se presenta como el primer modelo de decenas de miles de millones de parámetros entrenado íntegramente con potencia de cálculo y frameworks domésticos chinos.

La relevancia actual del repositorio radica en su carácter de despliegue listo para usar: FlagOS completó la adaptación multi-chip el mismo día del lanzamiento (Day-0) sobre nueve plataformas de chips (T-Head, NVIDIA, Moore Threads, Huawei Ascend, MetaX, Hygon, Iluvatar CoreX, Tsingmicro y ARM), con siete de ellas en BF16 y una variante cuantizada W4A8 para ARM. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con mHC + MLA + MTP (Mixture of Experts, Multi-head Latent Attention, Multi-Token Prediction) |
| Parámetros totales | 31.215.031.088 (~29B según model card; ~31,2B según safetensors) |
| Parámetros activos | ~4B |
| Longitud de contexto | 256K tokens nativo, extensible a 512K |
| Tipos de cuantización | BF16 (esta variante); W4A8 disponible para plataforma ARM |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |
| Tamaño del repositorio | 62,4 GB |
| Hardware objetivo de esta variante | Huawei Ascend 910C (x4 tarjetas, TP4) |
| Precisión | BF16 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE) en la que se activan aproximadamente 4B parámetros de un total de 29B por token procesado. Sobre esa base incorpora tres componentes destacados: mHC (mecanismo propietario del autor, sin detalle público en la información disponible), MLA (Multi-head Latent Attention, técnica de atención con compresión latente de las claves y valores para reducir el coste de memoria del KV cache) y MTP (Multi-Token Prediction, predicción de varios tokens por paso, habitualmente usada para decodificación especulativa y aceleración de la generación). La combinación de MLA con una ventana de 256K es coherente con el objetivo de sostener contextos muy largos sin un crecimiento desproporcionado del KV cache.

Según la model card, se trata del primer modelo de decenas de miles de millones de parámetros entrenado íntegramente con potencia de cálculo y frameworks domésticos chinos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o post-entrenamiento específico para agentes. Tampoco se detalla el mecanismo mHC más allá de su mención en el nombre de la arquitectura. La variante de este repositorio no es el modelo original, sino una adaptación de FlagOS al stack Ascend (CANN 8.5.0, SGLang 0.5.11 con plugin FlagOS), verificada mediante comparación de precisión contra el stack nativo de NVIDIA.

## Capacidades

- Generación de texto y razonamiento general en chino e inglés.
- Razonamiento matemático y de tipo científico (evaluado en Math-500 y GPQA Diamond).
- Modo de pensamiento extenso: la configuración de despliegue fija `SGLANG_MAX_THINK_TOKENS=70000`, lo que indica soporte de cadenas de razonamiento largas.
- Invocación de herramientas (tool calling / function calling), orientada a escenarios de agente.
- Planificación multietapa y ejecución de cadenas de razonamiento complejas para tareas de horizonte largo.
- Procesamiento de contextos muy largos (256K, extensible a 512K), adecuado para documentos extensos y memoria de agente.
- Predicción multi-token (MTP) para acelerar la decodificación.
- Capacidades multimodales, de audio o de visión: no disponibles en la información proporcionada.

## Casos de uso

- Agentes autónomos de ingeniería de software: el modelo puede planificar una tarea de refactorización en varios pasos, invocar herramientas de compilación y tests, y mantener el estado a lo largo de una sesión larga gracias a la ventana de 256K tokens.
- Automatización de atención al cliente multi-turno: con contexto de 256K puede arrastrar el historial completo de una conversación y documentación de producto sin truncar, y usar tool calling para consultar sistemas internos (pedidos, facturación).
- Análisis de documentación técnica extensa: ingesta de manuales, contratos o bases de código completas en una sola pasada para extracción de información estructurada y resumen con trazabilidad.
- Orquestación de pipelines de datos: uso como planificador que decide qué herramienta o script invocar en cada etapa, con razonamiento explícito antes de cada acción.
- Asistentes de investigación en matemáticas y ciencia: el modo de pensamiento largo y los resultados en Math-500 y GPQA lo hacen apto para resolución de problemas con verificación paso a paso.
- Despliegue en infraestructura no-NVIDIA: la variante Ascend permite ejecutar el modelo en clústeres con 4x Huawei 910C usando la imagen FlagOS y SGLang, útil en entornos con requisitos de soberanía tecnológica o suministro restringido de GPU.
- Evaluación comparativa de stacks de cómputo: sirve como banco de pruebas para medir la paridad de precisión entre el stack nativo NVIDIA y el stack FlagOS sobre Ascend.

## Benchmarks y rendimiento

| Métrica | Xing4.0-29B-A4B-Nvidia-Origin | Xing4.0-29B-A4B-Ascend-FlagOS |
|---|---|---|
| GPQA Diamond | 62,23 | 61,61 |
| Math-500 | 84,80 | 85,20 |

Los datos publicados solo cubren estas dos métricas y comparan la variante original en NVIDIA con la adaptación FlagOS en Ascend. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de agente (por ejemplo, SWE-bench o τ-bench), lo que limita la evaluación de sus capacidades agénticas declaradas.

## Requisitos de hardware

- VRAM estimada en BF16: los pesos ocupan aproximadamente 62,4 GB, por lo que se necesitan al menos 64 GB de memoria de acelerador solo para pesos, más KV cache y activaciones. Con contexto de 256K el KV cache puede ser muy voluminoso; MLA mitiga parcialmente este coste.
- GPU recomendadas: para esta variante concreta, 4x Huawei Ascend 910C en tensor parallel 4, según la guía de despliegue del autor.
- Cabe en GPU de consumo: no en BF16. Sería necesario recurrir a cuantizaciones de 4 bits (no publicadas para esta variante en la información disponible) para acercarse a configuraciones de 24-48 GB, y aun así el contexto largo quedaría muy limitado.
- Opciones de despliegue: SGLang 0.5.11 con plugin FlagOS (`SGLANG_PLUGINS=sglang_fl`, `SGLANG_FL_PLATFORM=ascend`, backend de comunicación HCCL) sobre la imagen Docker `harbor.baai.ac.cn/flagrelease-public/xing4.0-29b-a4b-ascend001-...`. El modelo usa `custom_code`, por lo que requiere confiar en el código remoto o revisarlo antes de cargarlo. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Entorno validado: openEuler 22.03 LTS-SP4, CANN 8.5.0 (driver y SDK), Docker 20.10.8, Python 3.11, `--shm-size 128g`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Xing4.0-29B-A4B (esta ficha) | ~29-31B / ~4B | 256K (512K extensible) | Apache 2.0 | MoE con MLA y MTP; orientado a agentes; adaptación multi-chip FlagOS |
| Familia TeleChat (predecesora) | no disponible | no disponible | no disponible | Base sobre la que se construye Xing4.0; sin datos concretos en la información disponible |
| Alternativas comparables de tamaño y contexto | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación rigurosa |

No se dispone de información suficiente y verificada sobre modelos competidores de la misma franja (MoE de ~30B con ~4B activos y contexto de 256K) para elaborar una comparativa con cifras contrastadas. Se recomienda no asumir equivalencias con otras familias sin datos publicados.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés declarados; el rendimiento en castellano u otras lenguas no está caracterizado y probablemente sea deficiente.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o alineación en la información disponible. Un modelo entrenado predominantemente con datos chinos puede reflejar sesgos culturales y políticos de esa procedencia.
- Alucinación: no hay datos publicados de tasas de alucinación ni de calibración; en tareas de agente con tool calling el riesgo de invocaciones erróneas debe mitigarse con validación externa.
- Contexto: aunque se declaran 256K nativos y 512K extensibles, no se aportan resultados de benchmarks de contexto largo (needle-in-a-haystack, RULER), por lo que la calidad efectiva en ventanas extremas no está verificada.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo incluye `custom_code`, lo que implica ejecutar código remoto; conviene auditar los ficheros de modelado antes de desplegar en producción.
- Madurez del ecosistema: la variante de este repositorio está atada a un stack muy específico (Ascend + CANN 8.5.0 + SGLang con plugin FlagOS). Las variables de entorno de la guía incluyen listas extensas de operadores en blacklist y overrides por operador, señal de que la paridad funcional con el stack nativo aún requiere ajustes manuales.
- Madurez del modelo: el repositorio tiene muy poca tracción (14 descargas, 1 like en el momento de la consulta), lo que reduce la probabilidad de que los problemas de despliegue estén documentados por la comunidad.
- Fecha de creación del repositorio: 2026-09-17, con última actualización 2026-11-04; verificar que la versión de pesos y la imagen Docker referenciada sigan disponibles.
- Benchmarks limitados a dos métricas (GPQA Diamond y Math-500); no hay evidencia publicada de rendimiento en código, agentes o tareas multilingües.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/Xing4.0-29B-A4B-BF16-ascend-FlagOS
- ModelScope (descarga de pesos): `modelscope download --model FlagRelease/Xing4.0-29B-A4B-BF16-ascend-FlagOS`
- Imagen Docker FlagOS para Ascend: `harbor.baai.ac.cn/flagrelease-public/xing4.0-29b-a4b-ascend001-gems5.3.0-tree0.6.0-cx0.13.0-pluginnone-vllmnone-sglang0.5.11-sglangfl0.1.0-cp311-ptnpu28-cann85-a64-none:202609181434`
- Paper, blog, repositorio de código o demo del modelo: no disponibles en la información proporcionada.
