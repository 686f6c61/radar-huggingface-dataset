# FlagRelease/Hy4-W8A8-tsingmicro-FlagOS

## Resumen

Hy4 es un modelo multimodal de gran escala desarrollado por Tencent Hunyuan, orientado a escenarios de productividad real. Esta ficha concreta corresponde a la variante W8A8 distribuida por la comunidad FlagRelease bajo el identificador `FlagRelease/Hy4-W8A8-tsingmicro-FlagOS`, es decir, una cuantización de 8 bits (pesos y activaciones) del modelo original adaptada al stack FlagOS y al hardware de Tsing Micro (aceleradores TX8110). El modelo combina percepción visual, razonamiento y uso de herramientas, e incorpora por primera vez comprensión de imágenes y capacidad de operar software de escritorio.

El modelo cuenta con 774.434.002.142 parámetros totales según los safetensors publicados, lo que lo sitúa en la categoría de modelos densos de gran tamaño (no se indica que sea MoE). El repositorio ocupa 789,6 GB, coherente con una cuantización de 8 bits de un modelo de ese tamaño. La longitud de contexto no se especifica en la información disponible.

La relevancia de esta variante es fundamentalmente de despliegue: FlagRelease ha completado una adaptación "Day-0" a nueve fabricantes de chips (Hygon, Kunlunxin, T-Head, NVIDIA, Huawei Ascend, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX) mediante el stack FlagOS 2.2. Según la model card, en pruebas con dos nodos y 16 GPU NVIDIA a 64 de concurrencia, la versión FlagOS alcanza hasta un 32,1 % más de throughput de salida y reduce la latencia media por token hasta un 39,2 % frente a la solución nativa de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Hunyuan Hy4; detalles internos no disponibles) |
| Parametros totales | 774.434.002.142 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8 (8 bits en pesos y activaciones), formato compressed-tensors |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion compressed-tensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su naturaleza multimodal (etiqueta `hy_v4_vl`) y de que se trata de un transformer de 774.434 millones de parámetros. La model card indica que la versión oficial de Hy4 amplía tanto el preentrenamiento como el postentrenamiento respecto a la versión preview, e introduce por primera vez comprensión visual y capacidad de operación de ordenador. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable de esta variante no está en el modelo base sino en el stack de despliegue: FlagOS integra FlagScale (framework distribuido de entrenamiento e inferencia), FlagGems (librería de operadores universales en Triton), FlagCX (librería de comunicación) y FlagTree (compilador unificado), junto con `vllm-plugin-fl`. Esto permite ejecutar el mismo modelo sobre aceleradores de distintos fabricantes con optimizaciones a nivel de framework y de operador específicas para Hy4. La cuantización W8A8 se distribuye en formato compressed-tensors, compatible con motores de inferencia que soporten dicho formato.

## Capacidades

- Generación de texto y razonamiento de propósito general en chino e inglés.
- Comprensión visual: percepción de imágenes, interpretación de gráficos complejos y documentos visuales.
- Operación de ordenador: control de software de escritorio y ejecución de tareas de interfaz gráfica (capacidad introducida en la versión oficial).
- Uso de herramientas (tool calling / function calling) combinado con razonamiento.
- Ejecución de tareas de horizonte largo (long-horizon task execution) y deep research.
- Razonamiento matemático y resolución de problemas científicos (puntuaciones altas en Math-500 y GPQA Diamond según la model card).
- Capacidades de desarrollo front-end y de videojuegos, ofimática financiera e investigación científica, según la descripción del autor.
- Mejora del seguimiento de instrucciones y de la comprensión de textos largos respecto a la preview.

## Casos de uso

- Automatización de operaciones de escritorio: el modelo puede interpretar capturas de pantalla y ejecutar secuencias de acciones sobre software profesional, adecuado para RPA de nueva generación en entornos con aplicaciones legacy.
- Análisis de gráficos y documentos financieros: extracción y razonamiento sobre tablas, gráficos e informes escaneados, aprovechando su capacidad de percepción visual para ofimática financiera.
- Asistencia al desarrollo front-end: generación y depuración de código de interfaz a partir de mockups o capturas, con soporte de tool calling para integrarse en pipelines de CI/CD.
- Investigación científica asistida: razonamiento sobre literatura y datos experimentales, con capacidad de deep research para tareas de síntesis y contraste de fuentes.
- Agentes multi-paso con uso de herramientas: ejecución de flujos que combinan llamadas a APIs, lectura de documentos e interacción con aplicaciones, gracias a la combinación de tool use y razonamiento de horizonte largo.
- Despliegue soberano sobre hardware no NVIDIA: al estar adaptado a chips de Hygon, Kunlunxin, T-Head, Huawei Ascend, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX, encaja en organizaciones que deben operar sobre aceleradores nacionales o con restricciones de suministro.
- Servicio de atención al cliente multimodal: gestión de conversaciones con adjuntos de imágenes o capturas, siempre que la ventana de contexto (no publicada) sea suficiente para el caso.

## Benchmarks y rendimiento

Resultados publicados en la model card. La columna de la variante Tsing Micro FlagOS figura como "Evaluating" (pendiente), por lo que solo se dispone de los valores de la versión nativa NVIDIA.

| Benchmark | Hy4-Nvidia-Origin | Hy4-Tsingmicro-FlagOS |
|---|---|---|
| Math-500 | 96,2 | pendiente de evaluacion |
| GPQA Diamond | 93,65 | pendiente de evaluacion |
| MMBench | 91,2 | pendiente de evaluacion |
| MMStar | 79,67 | pendiente de evaluacion |
| Terminal-Bench 4.0 | 44,4 (vs. 26,3 en preview) | no disponible |
| AutomationBench v1.0.6 | 56,2 (vs. 36,3 en preview) | no disponible |

Rendimiento de despliegue declarado por FlagRelease: en un test de dos nodos con 16 GPU NVIDIA a 64 de concurrencia, la versión FlagOS alcanza hasta un 32,1 % más de throughput de salida y hasta un 39,2 % menos de latencia media por token que la solución nativa de NVIDIA. En plataformas domésticas (T-Head, Huawei Ascend, Hygon, Moore Threads) el throughput por unidad de cómputo se aproxima o supera al de la versión nativa NVIDIA en algunos escenarios probados.

## Requisitos de hardware

- VRAM estimada: con 774,4 mil millones de parámetros en W8A8, el peso ronda 1 byte por parámetro, es decir, aproximadamente 775 GB solo para pesos; hay que añadir caché KV y overhead del runtime. No cabe en ninguna GPU de consumo.
- Configuración de referencia del autor: 32 aceleradores Tsing Micro TX8110 en un nodo, con `--tp 32` en el script de inferencia.
- GPU recomendadas: clústeres multi-GPU de clase datacenter (H100, A100 80 GB, Huawei Ascend, Hygon, T-Head, MetaX, Moore Threads, Iluvatar CoreX, Tsing Micro). El tensor paralelismo necesario implica al menos varias decenas de aceleradores.
- GPU de consumo: no es viable en RTX 4090 ni similares, ni siquiera con cuantizaciones más agresivas razonables.
- Opciones de despliegue: imagen Docker oficial `harbor.baai.ac.cn/flagrelease-public/hy4-w8a8-tsingmicro001-...-vllm0.24.0-...` con vLLM 0.24.0 y plugin FlagOS; descarga de pesos vía ModelScope. Compatible con clientes tipo AnythingLLM para la interfaz de usuario.
- Latencia y throughput: no se publican valores absolutos (tokens/s); solo mejoras relativas frente a la pila nativa NVIDIA (hasta +32,1 % de throughput y -39,2 % de latencia por token).

## Comparativa con modelos similares

No se dispone de datos de benchmark de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de contexto cualitativo:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Hy4 W8A8 (Tsing Micro FlagOS) | 774,4 B | no disponible | Apache 2.0 | Multimodal, adaptado a 9 fabricantes de chips vía FlagOS |
| Hy4 nativo NVIDIA (referencia) | 774,4 B (asumido) | no disponible | Apache 2.0 | Pila nativa; base de comparación de rendimiento |
| Hy4 preview | no disponible | no disponible | Apache 2.0 | Versión previa; sin visión ni control de escritorio |

## Limitaciones y advertencias

- El repositorio no registra descargas ni likes y fue creado en noviembre de 2026; se trata de una publicación muy reciente y de nicho, con poca validación comunitaria.
- Los benchmarks de esta variante concreta están pendientes ("Evaluating"); no hay confirmación independiente de que la cuantización W8A8 preserve la precisión de la versión nativa.
- Solo se declaran idiomas chino e inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- La longitud de contexto no se publica, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinación inherente a los modelos de gran escala, agravado en tareas de operación de software donde una acción errónea puede tener efectos reales; se recomienda supervisión humana y entornos sandbox.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue práctico exige hardware especializado (32 aceleradores TX8110 en la configuración de referencia) y el stack FlagOS, lo que limita la portabilidad real.
- La imagen Docker y los drivers (Tsm_driver 0.30279.6) están atados a la plataforma Tsing Micro; migrar a otro hardware requiere las variantes correspondientes de FlagRelease.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FlagRelease/Hy4-W8A8-tsingmicro-FlagOS
- Imagen Docker: `harbor.baai.ac.cn/flagrelease-public/hy4-w8a8-tsingmicro001-gems5.4.0-treenone-cx0.1.0-plugin0.0.0-vllm0.24.0-sglangnone-sglangflnone-cp310-pt211-raisa1.4.0-x64-v0.30279.6:202611180848`
- AnythingLLM (cliente de integración): https://anythingllm.com/
- Documentación de FlagOS, FlagScale, FlagGems, FlagCX y FlagTree: no disponible en la información proporcionada
- Paper técnico de Hy4: no disponible en la información proporcionada
