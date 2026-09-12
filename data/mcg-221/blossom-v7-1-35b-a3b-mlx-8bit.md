# McG-221/Blossom-V7.1-35B-A3B-mlx-8Bit

## Resumen

McG-221/Blossom-V7.1-35B-A3B-mlx-8Bit es una conversión al formato MLX del modelo Azure99/Blossom-V7.1-35B-A3B, publicada por el usuario McG-221. Es un modelo multimodal de tipo image-text-to-text, orientado a conversación y razonamiento, con arquitectura de mezcla de expertos (MoE) etiquetada como qwen3_5_moe en HuggingFace y un total de 34.660.608.768 parámetros en precisión de 8 bits.

La relevancia de esta ficha es eminentemente práctica: permite ejecutar localmente un modelo MoE de ~35B cuantizado a 8 bits sobre hardware de Apple Silicon mediante la librería MLX, sin necesidad de GPU dedicada, y bajo licencia Apache 2.0. Los idiomas declarados son inglés y chino.

La contrapartida es la escasez de información pública: el repositorio no incluye resultados de benchmarks, no especifica la longitud de contexto ni el proceso de entrenamiento del modelo base, y acumula cero descargas y cero valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) de tipo transformer; etiquetada como `qwen3_5_moe` en los tags de HuggingFace |
| Parametros totales | 34.660.608.768 (dato real de los safetensors) |
| Parametros activos | No disponible de forma explicita; la nomenclatura «A3B» del modelo base sugiere ~3.000 millones, sin confirmar |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx`, `safetensors`) |
| Pipeline | image-text-to-text (multimodal) |
| Modelo base | Azure99/Blossom-V7.1-35B-A3B |
| Tamano del repositorio | 36,8 GB |
| Version de conversion | mlx-lm 0.31.2 |

## Arquitectura y entrenamiento

La unica informacion tecnica confirmada es que se trata de una arquitectura de mezcla de expertos (MoE) y que el modelo deriva de Azure99/Blossom-V7.1-35B-A3B, convertido con mlx-lm 0.31.2. El tag `qwen3_5_moe` apunta a una familia de arquitectura tipo Qwen3.5 MoE, con enrutado disperso de expertos, lo que explicaria la nomenclatura «35B-A3B» (aproximadamente 35.000 millones de parametros totales y 3.000 millones activos por token). No se dispone de confirmacion oficial de este extremo.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o ajuste por preferencias, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). Tampoco se detalla el proceso de alineacion multimodal ni como se integra el codificador de vision. Toda la informacion de entrenamiento del modelo original deberia consultarse en la model card de Azure99/Blossom-V7.1-35B-A3B.

## Capacidades

- Generacion de texto conversacional multi-turno, segun los tags `conversational` y el pipeline declarado.
- Razonamiento explicito, segun el tag `reasoning` del repositorio (no se especifica si existe un modo de pensamiento o «thinking mode» diferenciado).
- Procesamiento multimodal de entrada imagen + texto (`image-text-to-text`).
- Capacidades multilingues limitadas a ingles y chino.
- Soporte de plantilla de chat (`apply_chat_template`), tal como muestra el ejemplo de uso de la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio o video: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede desplegarse con mlx-lm sobre Apple Silicon y mantener conversaciones multi-turno sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Analisis de capturas de pantalla y diagramas: al ser image-text-to-text, permite extraer informacion de imagenes (interfaces, esquemas, tablas) y devolverla en formato textual en ingles o chino.
- Soporte tecnico bilingue ingles-chino: su cobertura de ambos idiomas lo hace util para equipos que atienden documentacion o tickets en las dos lenguas.
- Prototipado e investigacion en portatiles Apple Silicon: con 36,8 GB de pesos en 8 bits, permite experimentar con un MoE de ~35B en un Mac de gama alta sin infraestructura de GPU.
- Procesamiento por lotes de contenido visual: generacion de descripciones, resumenes o metadatos a partir de imagenes en pipelines de catalogacion de contenido.
- Evaluacion comparativa de cuantizaciones MLX: sirve como referencia para medir la perdida de calidad entre 8 bits y otras precisiones de un mismo modelo base.
- Traduccion asistida con contexto visual: traduccion ingles-chino de material grafico (interfaces, carteles, documentacion escaneada) aprovechando la entrada multimodal.
- Educacion y tutoria: explicacion de material didactico con imagenes, resolviendo dudas en conversacion multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: el repositorio ocupa 36,8 GB en pesos de 8 bits, por lo que se necesita al menos esa cifra mas el espacio para la cache KV y el runtime. Se recomienda memoria unificada de 64 GB o superior; 48 GB queda muy justo.
- GPU recomendadas: no aplica en sentido estricto, ya que MLX esta disenado para Apple Silicon (familias M1/M2/M3/M4, especialmente variantes Max y Ultra). Para despliegue en GPU NVIDIA o AMD seria necesario reconvertir el modelo a otro formato, no disponible en este repositorio.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente (Mac Studio, MacBook Pro con chip Max o Ultra de 64 GB o mas). No cabe en GPUs de consumo con 24 GB o menos de VRAM.
- Opciones de despliegue: `mlx-lm` (version 0.31.2 o superior, segun la model card). Para la parte de vision probablemente se requiera `mlx-vlm`; no confirmado en la informacion disponible. vLLM, llama.cpp, Ollama y TGI no admiten pesos en formato MLX de forma nativa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| McG-221/Blossom-V7.1-35B-A3B-mlx-8Bit | 34.660.608.768 | No disponible | safetensors MLX 8 bits | Apache 2.0 | HuggingFace, 0 descargas |
| Azure99/Blossom-V7.1-35B-A3B (modelo base) | ~35B (nominal) | No disponible | No disponible | No disponible | HuggingFace |
| Otros modelos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente sobre el rendimiento del modelo ni sobre alternativas directas de la misma categoria como para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible estimar la calidad real del modelo frente a alternativas de tamano similar.
- Sin datos de adopcion (0 descargas, 0 likes): no hay senales de validacion por parte de la comunidad.
- Sesgos conocidos: no disponible en la informacion proporcionada; al ser un derivado de un modelo entrenado principalmente en ingles y chino, es previsible un sesgo cultural y linguistico hacia esos dos idiomas.
- Riesgo de alucinacion: no cuantificado; se aplican las precauciones habituales de cualquier modelo generativo, especialmente en tareas multimodales donde la interpretacion de imagenes puede inducir errores.
- Limitaciones de idioma: solo se declaran ingles y chino, por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales, no incluidos en esta ficha.
- Dependencia de plataforma: al estar en formato MLX, el modelo solo es ejecutable en Apple Silicon, lo que limita su uso en infraestructuras basadas en NVIDIA o en la nube convencional.
- El proceso de cuantizacion a 8 bits puede degradar ligeramente las capacidades de razonamiento y percepcion visual respecto al modelo original, sin que existan mediciones publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/McG-221/Blossom-V7.1-35B-A3B-mlx-8Bit
- Modelo base: https://huggingface.co/Azure99/Blossom-V7.1-35B-A3B
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos no guardan relacion con el objeto de la ficha.
