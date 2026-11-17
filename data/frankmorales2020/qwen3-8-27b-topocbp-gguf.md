# frankmorales2020/qwen3.8-27b-topocbp-gguf

## Resumen

Qwen 3.8-27B Topo-CBP GGUF es una cuantización en formato GGUF (Q8_0, 8 bits) del modelo base Qwen/Qwen3.8-27B, publicada por Frank Morales Aguilera bajo el paraguas de Sovereign Machine Laboratory (SOMALA). El autor presenta el modelo como una versión "gobernada" por su marco Topological Continual Backpropagation (Topo-CBP), que según la model card combina bloqueo de invariantes topológicos y optimización TopoAdamW para preservar estabilidad numérica durante el ajuste continuo.

El modelo conserva la arquitectura de la familia Qwen 3.8/3.5 (`qwen38`) con aproximadamente 26.900 millones de parámetros (dato real de safetensors), lo que lo sitúa en la franja de modelos densos de gran tamaño. Su orientación declarada son el razonamiento matemático de alta precisión, los flujos analíticos y la "ingeniería cognitiva determinista", con verificación sobre aceleración nativa en GPU.

La relevancia práctica del repositorio es limitada pero concreta: ofrece pesos listos para `llama.cpp` y `ollama` en cuantización Q8_0, con un ejemplo funcional de carga vía `llama-cpp-python` y descarga desde Hugging Face. No obstante, la información publicada es escasa en cuanto a datos de entrenamiento, idiomas, benchmarks comparativos y detalles del pipeline de cuantización, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.8/3.5 (`qwen38`); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el ejemplo de uso configura `n_ctx=4096` |
| Tipos de cuantizacion | Q8_0 (8 bits) en GGUF |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen3.8-27b-topocbp-Q8_0.gguf`); repo de 28,6 GB |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer de la familia Qwen 3.8/3.5 con 27 mil millones de parámetros (26,9 mil millones reales según safetensors), cuantizado a Q8_0 para su distribución en GGUF. El autor indica que los pesos están "gobernados" por el marco Topo-CBP (Topological Continual Backpropagation), que incluye bloqueo de invariantes topológicos y el optimizador TopoAdamW. No se especifica si este marco se aplicó durante un ajuste fino adicional sobre el modelo base o si es únicamente una capa conceptual de gobernanza; tampoco se detalla el volumen de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO.

No se han publicado detalles sobre innovaciones técnicas concretas como decodificación especulativa, atención lineal o mecanismos híbridos SSM. La información disponible se limita a la descripción del marco Topo-CBP y a la verificación de inferencia con aceleración CUDA nativa sobre una NVIDIA A100-SXM4 de 80 GB, sin datos sobre el proceso de entrenamiento o ajuste.

## Capacidades

- Generación de texto conversacional con plantilla de chat tipo ChatML (`<|im_start|>` / `<|im_end|>`), tal como muestra el ejemplo de la model card.
- Razonamiento matemático y demostraciones formales: el ejemplo oficial solicita una prueba por inducción de la suma de los primeros n números impares.
- Flujos analíticos y "deterministas" según la descripción del autor, orientados a ingeniería cognitiva.
- Compatibilidad con `llama.cpp`, `llama-cpp-python` y `ollama` para inferencia local.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card menciona un notebook "APAC_AGENTIC_GGUF" pero no detalla capacidades agénticas.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistencia matemática y demostraciones: el modelo puede emplearse para generar pruebas formales y desarrollos inductivos, como el ejemplo oficial de la suma de impares, con temperatura moderada y penalización de repetición para controlar la coherencia.
- Inferencia local en estaciones de trabajo con GPU: al distribuirse en GGUF Q8_0, se integra en `llama.cpp` con offload completo a GPU (`n_gpu_layers=-1`), lo que permite ejecutarlo en entornos sin servidores de inferencia dedicados.
- Prototipado rápido con `ollama`: el formato GGUF y la licencia Apache 2.0 facilitan desplegar el modelo en flujos de desarrollo local para pruebas de razonamiento y generación de texto.
- Evaluación de marcos de ajuste continuo: investigadores interesados en Topo-CBP pueden usar estos pesos como referencia para comparar estabilidad y plasticidad frente a cuantizaciones estándar del mismo modelo base.
- Generación de texto técnico y analítico: con una ventana de 4096 tokens configurada en el ejemplo, es adecuado para documentos cortos, explicaciones paso a paso y resúmenes técnicos.
- Integración en pipelines de Python vía `llama-cpp-python`: el snippet oficial permite incorporar el modelo a scripts de análisis que requieran generación de texto con control de tokens máximos, temperatura y stop tokens.

## Benchmarks y rendimiento

La única métrica publicada en la model card es de rendimiento de inferencia, no de calidad:

| Metrica | Valor | Condiciones |
|---|---|---|
| Throughput de generación | ~34 tokens/s | NVIDIA A100-SXM4 (80 GB), CUDA nativo, offload completo |
| Huella de memoria | No disponible en cifras | "Fully offloaded within VRAM envelope" según el autor |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: aproximadamente 27-29 GB solo para los pesos (26,9 mil millones de parámetros a ~8,5 bits efectivos), más overhead de contexto KV; el repo completo ocupa 28,6 GB.
- GPU recomendadas: A100-SXM4 de 80 GB (verificada por el autor); H100 y GPU profesionales con 32 GB o más son opciones razonables para offload completo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) con offload completo en Q8_0; requeriría offload parcial a CPU o una cuantización menor no publicada en este repo.
- Opciones de despliegue: `llama.cpp`, `llama-cpp-python` (con CUDA), `ollama`; compatible con endpoints según los tags del repositorio.
- Latencia y throughput: ~34 tokens/s en A100-SXM4 de 80 GB según la model card; no hay datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen 3.8-27B Topo-CBP GGUF | ~26,9 B | No disponible (ejemplo a 4096) | Q8_0 GGUF | Apache 2.0 | Marco Topo-CBP; ~34 tok/s en A100 |
| Qwen/Qwen3.8-27B (base) | ~26,9 B | No disponible | Safetensors originales | No disponible en la informacion | Modelo de referencia sin gobernanza Topo-CBP |
| Alternativas de ~27 B en GGUF | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificables |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta datos de entrenamiento, idiomas, contexto nativo ni benchmarks de calidad, lo que dificulta evaluar el modelo frente al base.
- El marco Topo-CBP no está descrito con detalle técnico verificable (sin paper enlazado en la información disponible); las afirmaciones de "gobernanza topológica" deben tratarse con cautela.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño; no se han publicado evaluaciones de fidelidad.
- El ejemplo oficial limita `n_ctx=4096`, muy por debajo de lo habitual en modelos de esta familia; verificar la longitud de contexto real antes de usarlo en producción.
- Sesgos conocidos: no disponibles; no se han publicado análisis de sesgo.
- Uso comercial permitido por licencia Apache 2.0, pero conviene verificar la licencia del modelo base Qwen subyacente antes de desplegarlo.
- Cuantización Q8_0: pérdida de precisión mínima pero no nula respecto a los pesos originales; no hay comparación publicada con el modelo base.
- Repositorio con 109 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/frankmorales2020/qwen3.8-27b-topocbp-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Notebook de cuantización: https://github.com/frank-morales2020/AST/blob/main/Qwen3dot8_27B_topo_cbp_gguf.ipynb
- Notebook agéntico: https://github.com/frank-morales2020/AST/blob/main/APAC_AGENTIC_GGUF.ipynb
