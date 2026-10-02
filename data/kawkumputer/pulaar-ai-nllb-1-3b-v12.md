# kawkumputer/pulaar-ai-nllb-1.3b-v12

## Resumen

Pulaar AI NLLB 1.3B v12 es un adaptador LoRA (PEFT) publicado por el usuario kawkumputer, entrenado sobre el modelo base facebook/nllb-200-distilled-1.3B. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (library_name: peft) que se carga junto al modelo base para ajustar su comportamiento, presumiblemente orientado a tareas de traducción automática, a juzgar por el nombre del repositorio ("pulaar-ai"), que sugiere un enfoque hacia el idioma pulaar/fulfulde.

El modelo base, NLLB-200 (No Language Left Behind) de Meta AI, es un sistema de traducción automática multilingüe de arquitectura transformer encoder-decoder con alrededor de 1.300 millones de parámetros en su variante destilada. El adaptador hereda por tanto esa arquitectura y las capacidades de traducción del base, y lo que aporta es un ajuste fino específico sobre unos pesos congelados. El repositorio ocupa 0,4 GB, tamaño coherente con un adaptador LoRA más que con pesos completos.

Es relevante ahora porque ejemplifica un patrón muy extendido en el ecosistema open source: reutilizar un modelo multilingüe grande y especializarlo para lenguas de bajos recursos mediante PEFT, sin necesidad de reentrenar desde cero. Conviene señalar que la model card está prácticamente vacía (plantilla sin rellenar), que el repositorio no tiene descargas ni likes, y que tanto la licencia como los idiomas soportados figuran como no disponibles, por lo que cualquier evaluación en producción exige validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer encoder-decoder del modelo base NLLB-200-distilled-1.3B |
| Parametros totales | 1.300 millones en el modelo base; el adaptador anade un conjunto reducido de parametros (no cuantificado de forma explicita en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base NLLB-200 emplea secuencias de hasta 1024 tokens |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones de la comunidad (int8, 4-bit, GGUF) |
| Idiomas soportados | no disponible (el nombre del repositorio sugiere pulaar/fulfulde, sin confirmar) |
| Licencia | no disponible para el adaptador; el modelo base NLLB-200 se distribuye bajo licencia CC-BY-NC-4.0 (no comercial) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador de tipo LoRA gestionado con la libreria PEFT (version 0.21.0 segun la model card) sobre facebook/nllb-200-distilled-1.3B. Esto implica que no se ha entrenado un modelo desde cero ni se ha reescrito la arquitectura: los pesos del transformer encoder-decoder de NLLB quedan congelados y el ajuste se aplica mediante matrices de bajo rango inyectadas en determinadas capas. La model card no especifica el rango del LoRA, las capas objetivo, la tasa de aprendizaje ni el numero de pasos, por lo que estos hiperparametros figuran como no disponibles.

Respecto a los datos de entrenamiento, la model card esta sin rellenar: no se documenta el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO (procedimientos que, por otra parte, no son habituales en adaptadores de traduccion). El unico enlace a un paper en las etiquetas es el arXiv:1910.09700, que corresponde a la referencia del calculo de impacto de carbono (Lacoste et al.) incluida en la plantilla y no a una publicacion tecnica del modelo. Tampoco se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Traduccion automatica multilingue: al derivar de NLLB-200, el modelo base esta disenado para traducir entre un gran numero de idiomas; el adaptador lo especializa, presumiblemente, hacia el pulaar.
- Generacion de texto condicionada a tarea de traduccion: entrada en un idioma origen, salida en el idioma destino, con control del token de idioma destino.
- Soporte multilingue: heredado del base (200 idiomas en la familia NLLB), aunque el subconjunto realmente cubierto por el adaptador no esta documentado.
- Tool calling / function calling: no disponible; no es una capacidad propia de un modelo de traduccion.
- Capacidades de agente y razonamiento multi-paso: no disponible; no es el proposito del modelo base ni del adaptador.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Traduccion de contenido hacia pulaar/fulfulde: usar el adaptador sobre NLLB-200-distilled-1.3B para traducir articulos, noticias o material educativo a esta lengua, tarea para la que el modelo base tiene cobertura limitada y que el ajuste pretende mejorar. Requiere validacion humana por la ausencia de benchmarks.
- Localizacion para comunidades de Africa Occidental: integracion en plataformas de publicacion para ofrecer versiones en pulaar de webs, campanas de salud publica o materiales institucionales, aprovechando que el despliegue de un adaptador de 1,3B es ligero.
- Preservacion linguistica y corpus paralelos: generacion asistida de traducciones que sirvan como borrador para construir corpus alineados de bajos recursos, siempre con supervision de hablantes nativos.
- Investigacion en NLP de bajos recursos: uso como punto de partida experimental para estudiar tecnicas de PEFT aplicadas a lenguas con pocos datos, comparando variantes del adaptador.
- Traduccion offline o en el borde: dado que el modelo base de 1,3B cabe en GPUs de consumo e incluso en CPU cuantizado, permite traducir sin conexion en entornos con conectividad limitada.
- Ajuste adicional sobre el adaptador: servir como base ("v12") para iteraciones posteriores del mismo autor, encadenando o combinando adaptadores LoRA para mejorar cobertura o dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (modelo base de 1.300 millones de parametros): aproximadamente 2,6 GB en fp16, 1,3 GB en int8 y 0,7 GB en cuantizacion de 4 bits; el adaptador anade una sobrecarga pequena.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 (por ejemplo RTX 3060, RTX 4060), y con holgura para lotes mayores en RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, es un modelo pequeno; cabe en la mayoria de GPUs consumer recientes, e incluso en CPU con cuantizacion.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador tal cual; para llama.cpp, Ollama o vLLM seria necesario fusionar el adaptador con el modelo base y exportar a un formato compatible (incluido GGUF), ya que estas herramientas no consumen el adaptador de forma nativa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pulaar-ai-nllb-1.3b-v12 (este) | 1.300 M (base) + adaptador LoRA | no disponible | no disponible | no disponible | HuggingFace, sin descargas |
| facebook/nllb-200-distilled-1.3B (base) | 1.300 M | 1024 tokens | 200 idiomas | CC-BY-NC-4.0 (no comercial) | HuggingFace |
| facebook/nllb-200-distilled-600M | 600 M | 1024 tokens | 200 idiomas | CC-BY-NC-4.0 | HuggingFace |
| facebook/m2m-100 | 418 M / 1.200 M | 1024 tokens | 100 idiomas | MIT (segun la version) | HuggingFace |

Los datos de la fila de este adaptador son los declarados en el repositorio; los del resto proceden de los modelos base publicos y pueden variar segun la version.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros del LoRA ni evaluacion, lo que impide reproducir o auditar el ajuste.
- Ausencia de benchmarks: no hay evidencia publicada de mejora sobre el modelo base; el rendimiento real es desconocido.
- Riesgo de alucinacion y de traducciones incorrectas: inherente a los modelos de traduccion, especialmente en lenguas de bajos recursos, donde los datos de entrenamiento son escasos.
- Sesgos conocidos: no documentados; los sesgos del modelo base (NLLB) en cuanto a cobertura desigual entre idiomas se heredan.
- Licencia del adaptador no disponible, y el modelo base NLLB-200 se distribuye bajo CC-BY-NC-4.0, lo que restringe el uso comercial salvo aclaracion del autor.
- Idiomas soportados sin confirmar: el nombre sugiere pulaar/fulfulde, pero no hay confirmacion ni lista de idiomas.
- Riesgo de sobreajuste o degradacion: al ser un adaptador pequeno sin evaluacion, puede empeorar la calidad general del base en idiomas no relacionados con su especializacion.
- Estado del repositorio: cero descargas y cero likes, creado en 2026, sin senales de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kawkumputer/pulaar-ai-nllb-1.3b-v12
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Referencia del paper citado en las etiquetas (calculo de impacto de carbono, Lacoste et al.): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
