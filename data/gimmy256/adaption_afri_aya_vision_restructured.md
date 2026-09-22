# gimmy256/adaption_afri_aya_vision_restructured

# adaption_afri_aya_vision_restructured

## Resumen

`adaption_afri_aya_vision_restructured` es un adaptador LoRA (PEFT) entrenado sobre el modelo multimodal `google/gemma-3-4b-it-VLM`. Lo publica el usuario `gimmy256` y no es un modelo completo: el repositorio (0,1 GB) contiene unicamente los pesos del adaptador en safetensors, que deben cargarse sobre el modelo base de 4B parametros para poder inferir.

El adaptador se ha entrenado con fine-tuning supervisado (SFT) en formato de chat utilizando AutoScientist, la herramienta de entrenamiento automatizado de Adaption Labs, sobre un dataset denominado `afri_aya_vision_restructured` de 9.339 filas. La distribucion tematica del corpus esta dominada por contenidos culturales (48%), seguidos de lengua (10%), cocina (10%), historia (8%) y religion (4%), lo que apunta a un ajuste orientado a conocimiento cultural y linguistico de contexto africano.

Su relevancia practica es limitada pero clara: sirve como ejemplo reproducible de un pipeline de adaptacion de subida rapida (1 epoca, LoRA r=8, 1e-5 de learning rate) sobre un VLM pequeno, y como caso de prueba para evaluar cuanto sesgo tematico introduce un corpus pequeno y muy desbalanceado. El repositorio no incluye pipeline declarado, idiomas soportados ni cifras de benchmark, y acumula 0 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer multimodal (vision-lenguaje) del modelo base Gemma 3 4B |
| Parametros totales | 4B en el modelo base; el adaptador ocupa 0,1 GB en disco (numero exacto de parametros del adaptador: no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador; heredada del modelo base (Gemma 3 4B) |
| Tipos de cuantizacion | No especificados en la ficha; al tratarse de un adaptador LoRA, la cuantizacion se aplica al modelo fusionado con herramientas externas (bitsandbytes, llama.cpp, etc.) |
| Idiomas soportados | No disponibles en la ficha del adaptador; el dataset de entrenamiento esta centrado en contenidos culturales africanos |
| Licencia | other (terminos no detallados en la model card) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors o equivalente |
| Modelo base | google/gemma-3-4b-it-VLM |
| Libreria | peft |
| Tipo de adaptacion | LoRA, r=8, alpha=16, dropout=0, modulos q_proj, k_proj, v_proj, o_proj |
| Dataset de entrenamiento | afri_aya_vision_restructured, 9.339 filas, formato chat |
| Hiperparametros | 1 epoca, lr 1e-5, scheduler coseno (0,5 ciclos), warmup ratio 0,1, weight decay 0,01, max_grad_norm 1, train_on_inputs=false |
| Etiquetas | peft, safetensors, gemma3, lora, adapter, adaption, license:other, region:us |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-4b-it-VLM`, un transformer multimodal de 4B parametros que procesa texto e imagenes. La adaptacion es un LoRA clasico de bajo rango (r=8, alpha=16, sin dropout) restringido a las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj), lo que deja congelado el resto del backbone, incluida la torre de vision. Esto implica que la capacidad visual efectiva del sistema es la del modelo base y que el ajuste solo modifica el comportamiento de atencion del decodificador de texto.

El entrenamiento fue un SFT en formato de chat, con `train_on_inputs: false` (solo se calcula la perdida sobre las respuestas), una sola epoca, learning rate 1e-5 y scheduler coseno con warmup del 10%. Batch size configurado como "max", 5 evaluaciones intermedias y `min_lr_ratio` 0,1. El corpus tiene 9.339 filas con una distribucion muy desbalanceada: cultura 48%, lengua 10%, cocina 10%, historia 8%, religion 4%, geografia 3%, arquitectura y diseno 3%, y una cola larga de categorias con 1-2% (fitness y deportes, gobernanza, agricultura, educacion, musica, arte, entretenimiento, empresa). Varias categorias aparecen con 0% (tecnologia, legal, ciencia, viajes, transporte, moda, familia, how-to). No se documenta el numero total de tokens vistos, la composicion idiomatica del corpus ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y comprension de imagenes heredadas del modelo base Gemma 3 4B IT, condicionadas al alcance del LoRA.
- Conversacion multi-turno en formato chat, con plantilla de chat aplicada mediante `apply_chat_template`.
- Mayor densidad de conocimiento factual y narrativo en los dominios sobrerrepresentados durante el ajuste: cultura (48%), lengua, cocina, historia y religion.
- Capacidad multilingue potencial heredada del modelo base; no verificada ni declarada para este adaptador.
- Tool calling / function calling: no documentado.
- Comportamiento agentico o razonamiento multi-paso: no documentado.
- Modo de pensamiento explicito (thinking mode): no documentado.
- Entrada de audio: no soportada por el modelo base indicado.
- Fusion de pesos soportada (`merge_and_unload`) para inferencia sin la capa PEFT.

## Casos de uso

- Turismo cultural especializado: descripcion y contextualizacion de patrimonios, tradiciones y practicas culturales africanas a partir de una imagen y una pregunta, aprovechando la combinacion de vision y el sesgo tematico del ajuste hacia cultura y arquitectura.
- Traduccion y adaptacion linguistica: reformulacion de textos hacia variantes y registros locales, dado que el 10% del corpus de entrenamiento corresponde a la categoria de lengua.
- Catalogacion gastronomica: generacion de fichas de recetas, ingredientes y tecnicas culinarias a partir de fotografias de platos, apoyandose en la categoria de cocina (10% del corpus).
- Contenido educativo de historia y religion: redaccion de materiales divulgativos o resumenes para aulas, con la advertencia de que estos dominios exigen verificacion factual por parte de un experto.
- Descripcion de imagenes para accesibilidad: generacion de texto alternativo en aplicaciones de lectura asistida, usando la torre de vision del modelo base.
- Prototipado rapido de asistentes sectoriales: al ser un adaptador de 0,1 GB sobre un modelo de 4B, permite desplegar y comparar variantes tematicas sin reentrenar un modelo completo.
- Investigacion sobre sesgo de dominio: caso de estudio de como una distribucion de datos desbalanceada (48% cultura frente a 0% tecnologia) desplaza el comportamiento del modelo, util para disenar experimentos de ablacion.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona una evaluacion sobre un conjunto de test retenido en distribucion y sobre un conjunto especifico de dominio para medir generalizacion, pero solo referencia dos imagenes (`training-metrics.png` y `win-rates.png`) sin cifras en el texto. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ninguna otra metrica comparable.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB; el coste real de inferencia lo determina el modelo base de 4B parametros.
- VRAM estimada (solo pesos del modelo base, sin cache KV): en bfloat16 en torno a 8-9 GB; en 8 bits en torno a 5 GB; en 4 bits en torno a 3-4 GB. La torre de vision y la cache de contexto anaden consumo adicional. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados por el autor.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bfloat16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090) y en GPUs de 4-6 GB si se cuantiza a 4 bits.
- GPU de datacenter recomendadas para mayor throughput: A100, H100, L40S.
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft` con fusion de pesos (`merge_and_unload`). Tras fusionar, el modelo resultante es compatible con stacks habituales de inferencia (vLLM, TGI) y, convertido a GGUF, con llama.cpp u Ollama. La ficha no documenta ninguna de estas integraciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adaption_afri_aya_vision_restructured | 4B (base) + LoRA r=8 | No especificado; heredado del base | Texto + vision | other (sin detallar) | Repositorio HF con 0 descargas |
| google/gemma-3-4b-it-VLM (modelo base) | 4B | El declarado por Gemma 3 4B | Texto + vision | Terminos de uso de Gemma | Publico y ampliamente desplegado |
| Alternativas multimodales de ~3-7B (Qwen2.5-VL, Llama 3.2 Vision, Phi-3.5-vision) | 3B-11B | No comparable sin datos verificados | Texto + vision | Variable segun familia | Publicas |
| Modelos ajustados al dominio africano de la familia Aya (Cohere For AI) | No disponible | No disponible | Texto | No disponible | Publicos, pero sin relacion directa con este adaptador |

No se dispone de datos de rendimiento del adaptador, por lo que la comparativa se limita a parametros, modalidad, licencia y disponibilidad.

## Limitaciones y advertencias

- Riesgo de sobreajuste: una sola epoca con r=8 sobre 9.339 filas es un ajuste muy superficial; el efecto real sobre el comportamiento del modelo no esta cuantificado en la ficha.
- Sesgo de dominio severo: el 48% del corpus es de tematica cultural y varias categorias relevantes (tecnologia, ciencia, legal, viajes) tienen 0%. El modelo puede degradar su rendimiento fuera de los dominios entrenados.
- Riesgo de alucinacion en contenidos factuales: historia, religion, gobernanza y geografia son areas donde un ajuste con SFT sobre datos no verificados puede reforzar afirmaciones incorrectas con mayor seguridad expresiva.
- La model card no detalla la procedencia, autoria ni licencia del dataset `afri_aya_vision_restructured`, lo que impide auditar posibles sesgos de contenido o derechos de terceros.
- Licencia "other" sin terminos explicitos: no se puede asumir uso comercial permitido. Ademas, al ser un derivado de Gemma 3, se aplican los terminos de uso del modelo base de Google, que el autor no reproduce en la ficha.
- Al ser un adaptador, la calidad final depende del modelo base exacto referenciado (`google/gemma-3-4b-it-VLM`); cambios o versiones distintas del base pueden alterar el comportamiento.
- No hay pipeline declarado, ni idiomas declarados, ni resultados de benchmark verificables: cualquier evaluacion de produccion debe hacerse por cuenta del integrador.
- Sin mantenimiento ni adopcion observables: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso que respalde su robustez.
- El ejemplo de codigo de la ficha usa `AutoModelForCausalLM` sin `trust_remote_code=False` explicito y sin gestion explicita de la entrada de imagen, por lo que la ruta multimodal no queda demostrada en la propia documentacion.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/gimmy256/adaption_afri_aya_vision_restructured
- Modelo base referenciado: https://huggingface.co/google/gemma-3-4b-it
- Adaption Labs (plataforma de entrenamiento AutoScientist): https://adaptionlabs.ai
- Documentacion de PEFT: https://huggingface.co/docs/peft
- No se han encontrado en la busqueda web articulos, papers, blogs ni demos relacionados con este modelo.
