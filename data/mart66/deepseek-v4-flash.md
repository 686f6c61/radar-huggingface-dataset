# mart66/DeepSeek-V4-Flash

## Resumen

DeepSeek-V4-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, presentado como parte de la serie DeepSeek-V4 junto con el modelo Pro. Esta ficha se basa en el repositorio `mart66/DeepSeek-V4-Flash`, un espejo no oficial del modelo original publicado por `deepseek-ai/DeepSeek-V4-Flash`. El modelo está diseñado para manejar contextos de hasta un millón de tokens con una eficiencia computacional muy superior a generaciones anteriores, gracias a una arquitectura de atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA).

Con 284 mil millones de parámetros totales y solo 13 mil millones activos por paso, DeepSeek-V4-Flash ofrece un rendimiento competitivo con un coste de inferencia relativamente bajo. Se ha preentrenado con más de 32 billones de tokens de alta calidad y ha pasado por un post-entrenamiento en dos etapas que incluye SFT, RL con GRPO y destilación on-policy. El modelo está disponible con licencia MIT y es apto para uso comercial y no comercial, lo que lo convierte en una opción relevante para desarrolladores que necesitan contexto ultralargo y capacidades de razonamiento avanzado.

La versión Flash-Max, con un mayor presupuesto de razonamiento, alcanza un rendimiento comparable al de la versión Pro en tareas de razonamiento, aunque queda ligeramente por detrás en conocimiento puro y en los flujos de trabajo agénticos más complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atencion hibrida CSA + HCA y Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 284B (el repo real muestra 290.944.641.402, aproximadamente 290,9B) |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 Mixto (Base), FP4 + FP8 Mixto (chat) |
| Idiomas soportados | no disponible (no especificado en la informacion) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien disponible en GGUF para LM Studio) |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash emplea una arquitectura MoE con una innovacion clave: la atencion hibrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA). Este diseño reduce drasticamente los FLOPs de inferencia y el uso de KV cache en contextos largos; en el caso de DeepSeek-V4-Pro, se reduce al 27% de los FLOPs y al 10% del KV cache respecto a DeepSeek-V3.2 en un contexto de 1M tokens. Ademas, incorpora Manifold-Constrained Hyper-Connections (mHC) para reforzar las conexiones residuales y mejorar la estabilidad de la propagacion de senal, y utiliza el optimizador Muon para una convergencia mas rapida.

El preentrenamiento se realizo sobre mas de 32 billones de tokens diversos y de alta calidad. El post-training sigue un paradigma en dos etapas: primero se cultivan expertos especializados por dominio mediante SFT y RL con GRPO, y despues se consolidan en un unico modelo mediante destilacion on-policy, integrando las distintas competencias en un solo conjunto de pesos.

## Capacidades

- Generacion de texto y razonamiento complejo, con modo de razonamiento extenso (Flash-Max) que permite pensar durante mas pasos.
- Generacion de codigo de alto nivel, con rendimiento top-tier en benchmarks de programacion segun los resultados reportados.
- Soporte de tool calling y flujos de trabajo agentes, incluyendo tareas de agente de varios pasos.
- Capacidades multilingues (aunque los idiomas concretos no estan especificados en la informacion disponible).
- Manejo de contexto de hasta 1M tokens, apto para documentos largos, analisis de repositorios de codigo o conversaciones multi-turno extensas.
- Compatible con pipelines de texto de transformers y con despliegue mediante endpoints (endpoints_compatible).

## Casos de uso

- **Analisis de documentacion y contratos legales**: con una ventana de 1M tokens, el modelo puede procesar documentos legales extensos completos, extrayendo clausulas relevantes y resumiendo el contenido sin fragmentar el texto.
- **Asistente de programacion a nivel de repositorio**: puede analizar un repositorio de codigo completo, entender la estructura, sugerir refactorizaciones y generar nuevas funciones con conocimiento de todo el contexto del proyecto.
- **Atencion al cliente automatizada**: gestiona conversaciones multi-turno con historial largo, gracias a la ventana de contexto amplia y a su capacidad de tool calling para consultar bases de conocimiento o sistemas de ticketing.
- **Razonamiento cientifico y analisis de literatura**: permite procesar articulos cientificos extensos, comparar metodologias y generar sintesis criticas con razonamiento detallado.
- **Agentes autonomos**: su soporte para tool calling y razonamiento multi-paso lo hace adecuado para agentes que interactuan con APIs, ejecutan tareas en varias etapas y toman decisiones basadas en contexto acumulado.
- **Traduccion y localizacion de contenido largo**: aunque los idiomas no estan especificados, su entrenamiento multilinguee (inferido) permite traducir documentos extensos manteniendo coherencia a lo largo de todo el texto.

## Benchmarks y rendimiento

Los resultados que se presentan corresponden a las versiones base (sin post-entrenamiento de chat) reportados en la model card. No se han publicado datos de la version chat en la informacion disponible.

| Benchmark (metrica) | # Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
| :--- | :---: | :---: | :---: | :---: |
| Params activados | - | 37B | 13B | 49B |
| Params totales | - | 671B | 284B | 1.6T |
| AGIEval (EM) | 0-shot | 80.1 | 82.6 | 83.1 |
| MMLU (EM) | 5-shot | 87.8 | 88.7 | 90.1 |
| MMLU-Redux (EM) | 5-shot | 87.5 | 89.4 | 90.8 |
| MMLU-Pro (EM) | 5-shot | 65.5 | 68.3 | 73.5 |
| MMMLU (EM) | 5-shot | 87.9 | 88.8 | 90.3 |
| C-Eval (EM) | 5-shot | 90.4 | 92.1 | 93.1 |
| CMMLU (EM) | 5-shot | 88.9 | 90.4 | 90.8 |

La version Flash-Max, con mayor presupuesto de razonamiento, logra un rendimiento en razonamiento comparable al Pro-Max, aunque queda por detras en tareas de conocimiento puro y en los flujos de trabajo agentes mas complejos.

## Requisitos de hardware

- **VRAM estimada**: con 284B parametros totales, en FP8 (1 byte por parametro) se necesitan aproximadamente 284 GB de VRAM para cargar los pesos. En FP4 para expertos y FP8 para el resto, el peso total se reduce a aproximadamente 160-200 GB, aunque no se ha publicado el valor exacto.
- **GPU recomendadas**: requiere multiples GPUs de nivel profesional, como NVIDIA A100 80GB, H100 80GB o H200. No cabe en una sola GPU de consumo (RTX 4090, 3090, etc.).
- **Opciones de despliegue**: compatible con vLLM, TGI (Text Generation Inference), NVIDIA NIM, y tambien disponible en LM Studio para uso local con cuantizacion GGUF.
- **Latencia y throughput**: no se han publicado datos concretos de latencia o throughput en la informacion disponible. Se espera una latencia menor que el modelo Pro gracias a sus 13B parametros activos, pero aun asi significativa por el tamaño total.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | MMLU (5-shot) | MMLU-Pro (5-shot) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| DeepSeek-V4-Flash | 284B | 13B | 1M | MIT | 88.7 | 68.3 |
| DeepSeek-V3.2 | 671B | 37B | 128K (no confirmado) | MIT | 87.8 | 65.5 |
| DeepSeek-V4-Pro | 1.6T | 49B | 1M | MIT | 90.1 | 73.5 |

La comparacion se basa en datos de la version base. DeepSeek-V4-Flash supera a V3.2 en todos los benchmarks con solo un tercio de los parametros activos, lo que demuestra la eficiencia de la nueva arquitectura. La diferencia con V4-Pro es notable en tareas de conocimiento, pero el Flash mantiene una relacion rendimiento/coste muy favorable.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han documentado sesgos especificos en la informacion disponible, pero como modelo entrenado con datos web, puede heredar sesgos sociales y culturales presentes en el corpus.
- **Riesgo de alucinacion**: aunque su rendimiento en razonamiento es alto, sigue siendo susceptible a alucinaciones, especialmente en contextos largos o cuando se le pide informacion muy especifica.
- **Limitaciones de contexto**: aunque la ventana es de 1M tokens, el rendimiento en la parte final del contexto puede degradarse en tareas de recuperacion de informacion precisa.
- **Restricciones de licencia**: la licencia MIT permite uso comercial sin restricciones, pero hay que verificar que el modelo oficial (deepseek-ai) mantiene la misma licencia. La card de este mirror indica MIT, pero es recomendable consultar la pagina oficial de DeepSeek.
- **Caveat de despliegue**: el tamaño del modelo (284B) hace que no sea viable en hardware de consumo; requiere infraestructura de multiples GPUs, lo que limita su uso a entornos profesionales.
- **Idiomas**: no se ha especificado la lista de idiomas soportados, por lo que se recomienda validar el rendimiento en el idioma objetivo antes de un despliegue en produccion.

## Enlaces

- Repositorio HuggingFace del mirror: https://huggingface.co/mart66/DeepSeek-V4-Flash
- Repositorio HuggingFace oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- ModelScope: https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash
- LM Studio: https://lmstudio.ai/models/deepseek-v4-flash
- NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-flash
- Lambda Inference: https://lambda.ai/inference-models/deepseek-ai/deepseek-v4-flash
- Paper tecnico (arXiv): https://arxiv.org/abs/2606.19348
- Web de DeepSeek: https://www.deepseek.com/
