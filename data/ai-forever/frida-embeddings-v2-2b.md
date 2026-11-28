# ai-forever/FRIDA-Embeddings-V2-2B

## Resumen

FRIDA-Embeddings-V2-2B es un modelo de embeddings de 2.213 millones de parametros desarrollado por ai-forever (Sberbank) para recuperacion semantica. Se construye mediante fine-tuning del modelo base Qwen/Qwen3.5-2B y se distribuye bajo licencia MIT. Su particularidad principal es que una unica pasada forward del backbone produce simultaneamente un vector denso de 2.048 dimensiones y vectores a nivel de token de 128 dimensiones, lo que permite combinar recuperacion densa, late-interaction (multivector) y recuperacion en dos etapas con un solo modelo.

El modelo esta orientado a tareas de retrieval sobre texto, codigo e imagenes de documentos (pipeline `visual-document-retrieval`), con soporte declarado para ingles y ruso. Incorpora Matryoshka Representation Learning (MRL) para truncar vectores sin reentrenar, y k-means pooling para reducir el numero de vectores por documento a presupuestos fijos. Esta pensado para equipos que necesitan ajustar el equilibrio entre almacenamiento, memoria y latencia sin cambiar de modelo.

Es relevante ahora porque unifica en un solo backbone lo que habitualmente requiere dos modelos separados (uno denso y otro de reranking multivector), y porque ofrece runtimes de produccion (vLLM, SGLang) y truncamiento flexible, lo que simplifica el despliegue de sistemas RAG y busqueda semantica a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B) adaptado a embeddings con pooling de ultimo token |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens por defecto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) y ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de 2.213 millones de parametros, y se adapta a la produccion de embeddings mediante fine-tuning. La representacion densa se obtiene con pooling de ultimo token y normalizacion L2, con 2.048 dimensiones. En paralelo, una proyeccion sin sesgo entrenada especificamente genera un vector de 128 dimensiones por token, tambien normalizado en L2, lo que habilita scoring de late-interaction tipo MaxSim.

El entrenamiento incorpora dos tecnicas destacables. Por un lado, Matryoshka Representation Learning (MRL), que permite truncar el vector denso a 1.024 o 512 dimensiones y los vectores de token a 64 o 32 dimensiones sin reentrenar. Por otro, k-means pooling durante el entrenamiento con presupuestos de 32, 64, 128, 256 y 512 vectores de token por documento, lo que reduce el almacenamiento en corpus con documentos largos. La mezcla de entrenamiento incluye documentos visuales, texto y codigo. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de embeddings densos de 2.048 dimensiones con truncamiento MRL a 1.024 y 512.
- Generacion conjunta de vectores a nivel de token de 128 dimensiones (truncables a 64 y 32) para late-interaction.
- Recuperacion densa, late-interaction multivector y recuperacion en dos etapas (densa + reranking MaxSim) con un solo forward pass.
- K-means pooling para limitar el numero de vectores por documento a 32, 64, 128, 256 o 512.
- Recuperacion sobre codigo (tag `code-retrieval`).
- Recuperacion sobre imagenes de documentos (pipeline `visual-document-retrieval`).
- Soporte multilingue limitado a ingles y ruso.
- Compatibilidad con Sentence Transformers, vLLM y SGLang.
- No se documenta soporte de tool calling, agentes ni modo thinking en la informacion disponible.

## Casos de uso

- Busqueda semantica en corpus bilingues ingles-ruso: el modelo cubre ambos idiomas de forma nativa, lo que permite indexar y consultar documentacion tecnica mixta sin modelos auxiliares de traduccion.
- RAG sobre documentacion larga: con contexto de 4.096 tokens y k-means pooling a 128 o 256 vectores por documento, se puede indexar manuales extensos manteniendo un coste de almacenamiento acotado.
- Recuperacion de codigo en repositorios: la etiqueta `code-retrieval` y el entrenamiento sobre codigo permiten construir busqueda semantica sobre funciones y fragmentos, util para asistentes de desarrollo internos.
- Recuperacion de documentos escaneados: el pipeline `visual-document-retrieval` y la inclusion de documentos visuales en el entrenamiento lo hacen adecuado para indexar facturas, formularios o PDFs escaneados.
- Recuperacion en dos etapas con presupuesto de latencia ajustado: el modo `mixed_30` recupera 30 candidatos por similitud densa y los reordena con MaxSim, equilibrando precision y coste computacional.
- Despliegue de alta concurrencia con vLLM o SGLang: al estar soportado por ambos runtimes, se puede servir como endpoint de embeddings en produccion con batching continuo.
- Sistemas con restricciones de almacenamiento: el truncamiento MRL a 512 dimensiones reduce el indice denso a una cuarta parte sin reentrenar, util en entornos con RAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de "Latency and storage benchmarks", pero no se incluyen cifras concretas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 4,4 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 8 GB.
- GPU recomendadas para produccion: A100, H100 o L40S para servir con vLLM o SGLang a concurrencia alta.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En cuantizacion de 4 bits el peso se reduce aproximadamente a 1,2 GB, aunque no se detallan formatos de cuantizacion soportados.
- Opciones de despliegue: Sentence Transformers (referencia), vLLM (soporta serving conjunto denso y multivector), SGLang. No se confirma soporte de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Representacion | Licencia | Idiomas |
|---|---|---|---|---|---|
| FRIDA-Embeddings-V2-2B | 2,21 B | 4.096 | Densa 2.048 + token 128 | MIT | en, ru |
| Qwen/Qwen3.5-2B (base) | 2,21 B | no disponible | Modelo generativo, no embedding | no disponible | no disponible |
| Alternativas de embeddings multilingues de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables verificados en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Cobertura linguistica limitada a ingles y ruso; el rendimiento en castellano u otros idiomas no esta garantizado.
- Ventana de contexto de 4.096 tokens por defecto; documentos mas largos requieren troceado o el uso de k-means pooling.
- Riesgo de alucinacion no aplica directamente al ser un modelo de embeddings, pero la calidad de recuperacion puede degradarse en dominios alejados de la distribucion de entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- El modelo esta recien publicado (creado el 2026-11-27) con 0 descargas y 1 like, por lo que carece de validacion externa de la comunidad.
- No se detallan los formatos de cuantizacion soportados, lo que puede complicar el despliegue en entornos de bajos recursos.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-2B del que deriva.
- No se documentan capacidades de tool calling ni de agentes; no debe asumirse que las herede del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/ai-forever/FRIDA-Embeddings-V2-2B
- Repositorio GitHub: https://github.com/ai-forever/FRIDA
- Articulo en Habr (RU): https://habr.com/ru/companies/sberbank/articles/1112312/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
