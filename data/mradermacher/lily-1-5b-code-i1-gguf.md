# mradermacher/Lily-1.5B-Code-i1-GGUF

## Resumen

Lily-1.5B-Code-i1-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo Lily-1.5B-Code, publicado por el usuario mradermacher en Hugging Face. El modelo base, alojado en el repositorio abhinav0231/Lily-1.5B-Code, es un modelo de lenguaje orientado a generacion de codigo con aproximadamente 1.500 millones de parametros (el campo de parametros reportado en los metadatos, 1.020.404, parece referirse a otra magnitud y no al conteo real de parametros del transformer, por lo que debe interpretarse con cautela). Este repositorio no contiene pesos originales en safetensors, sino conversiones cuantizadas generadas con llama.cpp.

La relevancia de esta ficha radica en que permite ejecutar un modelo de codigo de ~1,5B en hardware de consumo mediante cuantizacion. El autor de las cuantizaciones, mradermacher, es conocido por producir versiones GGUF de modelos pequenos y medianos con matrices de importancia (imatrix) para mejorar la calidad en bits bajos. El repositorio incluye un amplio conjunto de niveles de cuantizacion, desde IQ1_S e IQ2_XXS hasta Q6_K, lo que permite ajustar el equilibrio entre tamano y fidelidad.

La informacion publica disponible es muy limitada: no hay model card descriptiva del modelo base en los datos proporcionados, no se especifican licencia, idiomas ni pipeline, y el repositorio de cuantizaciones no registra descargas ni likes en el momento de la consulta. Por tanto, esta ficha distingue explicitamente entre lo confirmado y lo no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, segun el formato de pesos; no confirmado en la informacion) |
| Parametros totales | ~1,5B segun el nombre del modelo; el metadato safetensors reporta 1.020.404 (dato ambiguo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, Q4_1, IQ3_XS, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp); pesos originales del modelo base no incluidos en este repo |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Lily-1.5B-Code en los datos proporcionados. El nombre sugiere un modelo de ~1,5B parametros especializado en codigo, pero no se confirma si emplea un transformer denso clasico, atencion lineal, decodificacion especulativa u otra innovacion. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo unico verificable es el proceso de cuantizacion: las etiquetas del README indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que las cuantizaciones se generaron a partir de pesos en formato Hugging Face convertidos a GGUF. El autor indica que se usaron cuantizaciones con matrices de importancia (weighted/imatrix quants), una tecnica que calibra la cuantizacion con datos de activacion para reducir la perdida de calidad en niveles bajos (IQ1, IQ2, IQ3). El conjunto de niveles cubre desde ~1 bit por peso hasta Q6_K.

## Capacidades

- Generacion de codigo: el nombre del modelo sugiere especializacion en tareas de programacion, pero no hay documentacion que detalle lenguajes soportados ni calidad.
- Generacion de texto general: no confirmado.
- Razonamiento y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Autocompletado de codigo en local: al ser un modelo de ~1,5B cuantizado a Q4_K_M o Q5_K_M, puede ejecutarse en portatiles con GPU de gama media o incluso en CPU, ofreciendo sugerencias de codigo sin enviar datos a la nube.
- Prototipado rapido en entornos con recursos limitados: util para equipos que quieren experimentar con un modelo de codigo pequeno antes de escalar a modelos mayores.
- Asistente de programacion integrado en editores: mediante llama.cpp u Ollama, puede servir como backend local para plugins de autocompletado en VS Code u otros IDE.
- Generacion de fragmentos de codigo en pipelines de documentacion: para producir ejemplos de codigo en documentacion tecnica, con revision humana posterior.
- Experimentacion en investigacion sobre cuantizacion: el amplio rango de niveles (desde IQ1_S hasta Q6_K) permite estudiar la degradacion de calidad en modelos de codigo pequenos.
- Despliegue en dispositivos edge: las cuantizaciones IQ2 e IQ3 permiten ejecutar el modelo en dispositivos con poca memoria, aunque con perdida de calidad significativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (aproximada, para ~1,5B parametros):
  - Q6_K: ~1,3-1,4 GB
  - Q5_K_M: ~1,1-1,2 GB
  - Q4_K_M: ~0,9-1,0 GB
  - Q3_K_M: ~0,7-0,8 GB
  - IQ2_XXS / IQ1_S: ~0,4-0,6 GB
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones medias; RTX 3060, RTX 4060, GTX 1660 o superiores son suficientes. Para cuantizaciones altas (Q6_K) se recomienda 4 GB o mas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4 GB o mas; las cuantizaciones IQ2/IQ3 pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles; dependen del hardware y del nivel de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Lily-1.5B-Code-i1-GGUF | ~1,5B | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-Coder-1.5B | 1,5B | 32K (segun documentacion publica del modelo) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| DeepSeek-Coder-1.3B | 1,3B | 16K (segun documentacion publica) | DeepSeek License | safetensors, GGUF | Hugging Face |
| StarCoder2-3B | 3B | 16K (segun documentacion publica) | BigCode OpenRAIL-M | safetensors, GGUF | Hugging Face |

Nota: los datos de los modelos comparativos provienen de conocimiento general publico y no de la informacion proporcionada en esta busqueda; deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan sesgos, datos de entrenamiento ni evaluaciones, lo que impide evaluar riesgos de alucinacion o sesgo.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base (abhinav0231/Lily-1.5B-Code) antes de usarlo en produccion.
- Idiomas no confirmados: no hay garantia de soporte multilingue ni de calidad en castellano.
- Contexto desconocido: no se puede planificar su uso en tareas que requieran ventanas largas.
- Cuantizaciones muy agresivas (IQ1, IQ2): la calidad del codigo generado puede degradarse notablemente; se recomienda Q4_K_M o superior para uso practico.
- Modelo de ~1,5B: capacidad limitada en comparacion con modelos de 7B o superiores; adecuado para tareas simples, no para razonamiento complejo.
- Repositorio sin descargas ni likes: no hay evidencia de validacion por la comunidad.
- El metadato de parametros (1.020.404) es inconsistente con el nombre del modelo; conviene verificar el conteo real en el repositorio base.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Lily-1.5B-Code-i1-GGUF
- Modelo base: https://huggingface.co/abhinav0231/Lily-1.5B-Code
