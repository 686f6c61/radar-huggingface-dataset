# aliwister/ali-llm-safe-unsafe

## Resumen

Ali-llm-safe-unsafe es un modelo de generacion de texto publicado por el usuario aliwister en HuggingFace, con un total de 2.049.054.720 parametros (aproximadamente 2,05 mil millones) y distribuido en formato safetensors bajo licencia Apache 2.0. Se trata de un ajuste (finetune) del modelo aliwister/ali-llm-safe, segun indican los metadatos de base_model, y esta etiquetado como recurso de investigacion en seguridad (safety-research) con un enfoque de aprendizaje curricular (curriculum-learning) y continued pretraining.

El problema que aborda se enmarca en el estudio de comportamientos seguros e inseguros en modelos de lenguaje: las etiquetas apuntan a un uso educativo y de investigacion, no a un despliegue de produccion convencional. El modelo es monolingue en ingles (idioma declarado: en) y su acceso es restringido (gated), por lo que requiere aceptar condiciones en HuggingFace antes de poder descargarlo.

La relevancia actual es limitada y experimental: no hay descargas ni likes registrados en el momento de redactar esta ficha, no se publican resultados de benchmarks y la arquitectura concreta, la longitud de contexto y los datos de entrenamiento no estan documentados en la informacion disponible. Debe tratarse, por tanto, como una pieza de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el pipeline text-generation y la libreria transformers apuntan a un modelo de lenguaje causal; la arquitectura concreta no se especifica) |
| Parametros totales | 2.049.054.720 (aproximadamente 2,05 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors; no se publican versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | aliwister/ali-llm-safe |
| Requiere codigo remoto | si (etiqueta custom_code, requiere trust_remote_code=True) |
| Acceso | restringido (gated, requiere aceptar condiciones en HuggingFace) |
| Tamano del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. El pipeline declarado es text-generation, la libreria es transformers y el formato de pesos es safetensors, lo que es coherente con un modelo de lenguaje causal de tipo transformer decoder-only, pero no se confirma ni la disposicion exacta de capas, ni el mecanismo de atencion, ni si incorpora componentes hibridos (MoE, SSM u otros). La presencia de la etiqueta custom_code indica que el modelo requiere cargar codigo remoto del repositorio para poder instanciarse.

En cuanto al entrenamiento, las etiquetas disponibles describen el proceso como continued pretraining sobre aliwister/ali-llm-safe, con tecnicas de curriculum-learning y orientado a investigacion en seguridad y educacion. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento preferencial. Tampoco se documentan innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). El nombre del modelo (safe-unsafe) sugiere que el ajuste explora la frontera entre comportamientos seguros e inseguros, probablemente con fines de auditoria o estudio de riesgos, pero esto no se detalla en los metadatos.

## Capacidades

- Generacion de texto en ingles mediante el pipeline text-generation de transformers.
- Ajuste orientado a investigacion en seguridad, con posible comportamiento dual (contenido seguro e inseguro) segun el diseno del curriculum, segun indican las etiquetas safety-research y el propio nombre del modelo.
- Uso educativo y de continued pretraining, segun las etiquetas education y pretraining del repositorio.
- Idiomas: unicamente ingles segun el campo de idioma declarado.
- Soporte de tool calling o function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multimodales (vision, audio): no disponible (no se documenta).
- Modo de razonamiento explicito (thinking mode): no disponible (no se documenta).

## Casos de uso

- Investigacion en seguridad de modelos de lenguaje: el modelo puede emplearse como sujeto de estudio para analizar como responde ante prompts seguros e inseguros, comparandolo con su modelo base aliwister/ali-llm-safe y documentando diferencias de comportamiento.
- Auditoria de riesgos en pipelines de IA: dado su caracter gated y su etiqueta safety-research, sirve para construir baterias de pruebas de red-teaming controladas en entornos de laboratorio.
- Docencia y material educativo sobre alineamiento: el modelo puede utilizarse en cursos o talleres para ilustrar los efectos de un entrenamiento por curriculum en las respuestas del sistema.
- Experimentos de continued pretraining reproducibles: al estar vinculado a un modelo base identificado, permite reproducir y extender estudios sobre como afecta el ajuste posterior al rendimiento del modelo original.
- Generacion de texto en ingles para prototipos internos: con 2,05 mil millones de parametros, puede ejecutarse en hardware modesto para pruebas de generacion, siempre que se acepte la licencia y el caracter experimental del modelo.
- Comparativas controladas de comportamiento seguro frente a inseguro: util para equipos que necesiten evaluar si un modelo filtra o reproduce contenido nocivo bajo distintas estrategias de prompting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el numero de parametros (2,05 mil millones):
  - FP32: aproximadamente 8,2 GB de pesos.
  - FP16/BF16: aproximadamente 4,1 GB de pesos, mas memoria para activaciones y cache KV.
  - INT8: aproximadamente 2,1 GB de pesos.
  - INT4: aproximadamente 1,0 a 1,2 GB de pesos.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM cubre FP16 con margen razonable; para INT8 o INT4 bastan 4 a 6 GB. Modelos como RTX 3060 (12 GB), RTX 4070, RTX 4080 y RTX 4090 pueden ejecutarlo comodamente; A100 o H100 solo tienen sentido para lotes grandes o entrenamiento adicional.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo de gama media y alta, siempre que se use FP16 o cuantizacion inferior.
- Opciones de despliegue: transformers (requiere trust_remote_code=True por la etiqueta custom_code), y potencialmente vLLM, TGI o llama.cpp si se realizan conversiones, ya que no se publican pesos GGUF ni formatos pre-cuantizados.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Benchmarks publicos |
|---|---|---|---|---|---|
| aliwister/ali-llm-safe-unsafe | 2,05 mil millones | no disponible | Apache 2.0 | gated | no disponible |
| Qwen2.5-1.5B | 1,5 mil millones | 32.768 tokens | Apache 2.0 | abierto | publicados por el autor |
| SmolLM2-1.7B | 1,7 mil millones | 8.192 tokens | Apache 2.0 | abierto | publicados por el autor |
| Gemma 2 2B | 2,6 mil millones | 8.192 tokens | Gemma Terms | abierto con condiciones | publicados por el autor |

La comparativa se limita a parametros, contexto, licencia y disponibilidad, porque para ali-llm-safe-unsafe no hay datos de rendimiento publicados que permitan una comparacion cuantitativa fiable. Los valores de contexto y licencia de los modelos alternativos corresponden a sus fichas oficiales conocidas; conviene verificarlos en el momento de su uso.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes en el momento de redactar la ficha: no hay validacion por parte de la comunidad.
- No se publican benchmarks, por lo que se desconoce su rendimiento real frente a alternativas de tamano similar.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que complica la automatizacion en CI/CD.
- Requiere trust_remote_code=True (etiqueta custom_code), lo que implica ejecutar codigo del repositorio y anade riesgo de seguridad en el despliegue.
- Idiomas: solo ingles segun el campo declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificacion previa.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; al no existir evaluaciones publicadas, no es posible acotarlo.
- Caracter de investigacion en seguridad (safety-research) y nombre safe-unsafe: el modelo podria reproducir contenido inseguro por diseno, algo que debe tenerse en cuenta antes de cualquier uso abierto al publico.
- Sesgos conocidos: no disponible (no se documentan evaluaciones de sesgo).
- Licencia Apache 2.0: permite uso comercial en teoria, pero la naturaleza gated y experimental del modelo hace recomendable una revision legal y tecnica antes de llevarlo a produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aliwister/ali-llm-safe-unsafe
- Modelo base: https://huggingface.co/aliwister/ali-llm-safe
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada.
