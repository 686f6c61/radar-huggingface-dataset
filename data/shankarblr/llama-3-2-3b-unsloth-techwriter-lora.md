# Shankarblr/Llama-3.2-3B-Unsloth-TechWriter-LoRA

## Resumen

Shankarblr/Llama-3.2-3B-Unsloth-TechWriter-LoRA es un ajuste fino especializado del modelo meta-llama/Llama-3.2-3B-Instruct, orientado a la redacción de documentación técnica y marketing técnico de semiconductores e interconexión de centros de datos: adaptadores Ethernet, silicio de conmutación (switch silicon), DPU y adaptadores de almacenamiento. El autor lo entrenó con Unsloth FastLanguageModel y el SFTTrainer de TRL mediante QLoRA sobre una GPU RTX 3090, partiendo de los pesos unosloth/Llama-3.2-3B-Instruct en formato bnb-4bit y publicando el resultado como pesos fusionados en fp16 (3.212.749.824 parámetros, 6,4 GB de repositorio).

Se trata de un modelo denso y pequeño (categoría 3B), no de un MoE, por lo que su interés no está en el rendimiento bruto de razonamiento sino en la especialización vertical: el objetivo declarado es generar borradores internos on-genre con estilo editorial homogéneo (un único nodo de proceso, un throughput primario y un factor de forma por documento), además de extraer especificaciones y responder preguntas cortas y ancladas sobre un extracto pegado en el prompt.

Su relevancia actual es la de servir como caso de estudio de ajuste fino barato y reproducible (QLoRA sobre una sola GPU de consumo) aplicado a un dominio documental muy concreto, con despliegue local vía Ollama o llama.cpp en un GGUF Q4_K_M exportado por el mismo autor. La model card advierte explícitamente de que no es un producto oficial de ningún fabricante y de que puede inventar SKUs cuando el producto solicitado estaba poco representado en los datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), pesos fusionados tras QLoRA |
| Parametros totales | 3.212.749.824 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 000 tokens heredados del modelo base Llama 3.2 3B; la model card solo documenta max_seq_length=2048 en el ejemplo de Unsloth FastInference |
| Tipos de cuantizacion | fp16 (pesos fusionados publicados), bnb-4bit (formato de carga del modelo base durante el entrenamiento), GGUF Q4_K_M exportado; reexportacion a q8_0 mencionada como opcion |
| Idiomas soportados | en (inglés) declarado; el ajuste fino esta orientado a contenido tecnico en ingles y el autor excluye explicitamente otros idiomas |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (fp16 fusionado), adaptador PEFT/LoRA y GGUF Q4_K_M |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de la familia Llama 3.2, en su variante de 3B parámetros. El ajuste se realizó con QLoRA: los pesos base se cargaron en 4 bits (unsloth-bnb-4bit) y se entrenaron adaptadores de bajo rango con Unsloth FastLanguageModel más el SFTTrainer de TRL, en una RTX 3090 y en fp16, según la model card. El artefacto publicado en este repositorio corresponde a los pesos ya fusionados, no a un adaptador suelto (véase la discrepancia de nomenclatura en limitaciones).

Los datos de entrenamiento son una mezcla privada de tipo SFT con formato ChatML (estructura `messages[{role, content}]`, procesada con `tokenizer.apply_chat_template`), compuesta por PDFs de fabricantes extraídos y documentación sintética depurada, con un 10 % reservado como holdout. El entrenamiento duró 3 épocas y no se documenta ninguna fase de RLHF, DPO o preferencias; la única señal reportada es la pérdida de evaluación. La model card insiste en que debe usarse la plantilla de chat de Llama 3.2 Instruct y no un ChatML estilo Qwen, y en que el `generation_config.json` incluye un `max_length` residual que obliga a pasar únicamente `max_new_tokens` en la generación.

## Capacidades

- Generación de texto largo y estructurado en inglés con estilo editorial técnico homogéneo (product briefs, notas de aplicación, secciones de guías de usuario).
- Redacción de fichas de producto y listas de características (datasheets) para adaptadores Ethernet, switch silicon, DPU y adaptadores de almacenamiento.
- Descripción de interfaces y flujos de trabajo estilo CLI para hosts y adaptadores, manteniendo coherencia de sintaxis dentro de un mismo documento.
- Extracción de especificaciones y respuesta corta anclada a un extracto pegado en el prompt (QA grounded de alcance limitado).
- Mantenimiento de coherencia interna en borradores: un nodo de proceso, un throughput primario y un factor de forma, salvo que la fuente liste opciones.
- Seguimiento de instrucciones de sistema para fijar el rol de redactor técnico y el tipo de documento solicitado.
- Capacidad conversacional multi-turno dentro del nicho, heredada del modelo Instruct base.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Multilingüismo: limitado al inglés por diseño; el autor lo excluye explícitamente para otros idiomas.

## Casos de uso

- Redacción de product briefs de familias de adaptadores de red: el modelo genera el documento completo (posicionamiento, tabla de especificaciones, casos de aplicación) a partir de una instrucción breve, manteniendo el registro de marketing técnico de semiconductores que se le enseñó.
- Elaboración de fichas técnicas y listas de características: adecuado para producir el primer borrador de un datasheet interno, siempre que un ingeniero valide después los números y los SKUs.
- Redacción de secciones de guías de usuario estilo CLI: describe comandos, parámetros y flujos de configuración de hosts y adaptadores, con coherencia sintáctica dentro del documento.
- Extracción de especificaciones sobre un extracto pegado: al pegar un fragmento de documentación de proveedor, el modelo resume y reorganiza los datos en tablas o listas, lo que sirve como paso previo a una revisión humana.
- Normalización de estilo editorial: dado que fue ajustado con una mezcla de documentos de proveedor, puede reescribir borradores internos para alinearlos con un estilo de casa único antes de pasarlos a publicación.
- Notas de aplicación y contenido de soporte técnico: generación de descripciones de escenarios de despliegue (convergencia de red, almacenamiento, interconexión de centros de datos) para material interno de preventa.
- Despliegue local por confidencialidad: al pesar 6,4 GB en fp16 y existir un GGUF Q4_K_M, puede ejecutarse íntegramente en una estación de trabajo o portátil con Ollama o llama.cpp, sin enviar borradores confidenciales a servicios en la nube.
- Base para nuevos ajustes de dominio: al ser un modelo de 3B con licencia Llama 3.2, sirve como punto de partida para adaptadores adicionales sobre subnichos documentales con un coste de entrenamiento bajo.
- Prototipado rápido de generación documental en pipelines internos: etiquetado como text-generation-inference y endpoints_compatible, puede exponerse como endpoint compatible con las API habituales para pruebas internas.

## Benchmarks y rendimiento

Los únicos resultados publicados son las pérdidas de evaluación declaradas por el autor en el model-index, todas marcadas como no verificadas (`verified: false`) y medidas sobre un holdout del 10 % de una mezcla SFT privada en formato ChatML. No hay MMLU, HumanEval, GSM8K ni métricas de calidad documental.

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| Eval loss (epoca 1) | private ChatML SFT mix (10 % holdout), split test | 0.3627 | no |
| Eval loss (epoca 2) | private ChatML SFT mix (10 % holdout), split test | 0.1934 | no |
| Eval loss (epoca 3) | private ChatML SFT mix (10 % holdout), split test | 0.1614 | no |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La pérdida decreciente entre épocas indica ajuste progresivo al corpus privado, pero no permite inferir capacidades generales ni comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 6,4 GB de pesos más caché KV; con contexto de 2 048 tokens, entre 8 y 10 GB de VRAM dedicada son suficientes.
- VRAM estimada en 4 bits (Q4_K_M): alrededor de 2 GB de pesos, por lo que cabe en GPU de consumo con 4-6 GB de VRAM.
- GPU recomendadas: RTX 3090 (la usada por el autor para el entrenamiento), RTX 4090, RTX 4080, RTX 4070 Ti, A100 y H100 para fp16 con contextos largos o lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más para fp16 y desde 4-6 GB en cuantización de 4 bits; también en CPU mediante llama.cpp u Ollama, con latencia mucho mayor.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `torch_dtype=torch.float16`, Unsloth `FastLanguageModel.for_inference` (carga en 4 bits), Ollama y llama.cpp con el GGUF Q4_K_M, y text-generation-inference (TGI) según las etiquetas del repositorio y su compatibilidad con endpoints. No se menciona vLLM en la información disponible.
- Advertencia de configuración: pasar solo `max_new_tokens` en `generate`, ya que el `generation_config.json` conserva un `max_length` residual de Unsloth/Transformers 5.x; con decodificación greedy (`do_sample=False`) los valores residuales de `temperature` y `top_p` se ignoran.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentación pública habitual y no estaban incluidos en la búsqueda web de esta ficha; se marcan como referencia externa.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Shankarblr/Llama-3.2-3B-Unsloth-TechWriter-LoRA | 3.212.749.824 | 128 000 tokens (heredado del base) | Llama 3.2 Community License | Ajuste fino vertical en documentación técnica de semiconductores; solo inglés |
| meta-llama/Llama-3.2-3B-Instruct | ~3.210 millones (referencia externa) | 128 000 tokens (referencia externa) | Llama 3.2 Community License | Modelo generalista de instrucciones, multilingüe; base de este ajuste |
| Qwen/Qwen2.5-3B-Instruct | ~3.090 millones (referencia externa) | 32 768 tokens (referencia externa) | Apache 2.0 (referencia externa) | Generalista, buen soporte multilingüe y de tool calling |
| microsoft/Phi-3.5-mini-instruct | ~3.820 millones (referencia externa) | 128 000 tokens (referencia externa) | MIT (referencia externa) | Generalista orientado a razonamiento y código |

Frente a estas alternativas generalistas, el modelo de Shankarblr no compite en capacidades generales: su ventaja es el estilo y la coherencia de dominio en documentación de interconexión, y su desventaja es el idioma único y la ausencia de evaluaciones comparables. No se han publicado comparativas de rendimiento directas en la información disponible.

## Limitaciones y advertencias

- Riesgo de alucinación de SKUs: el propio autor advierte de que inventará referencias de producto si se le pide un brief de un producto poco representado o ruidoso en los datos de entrenamiento.
- No es una fuente autoritativa de cifras: los números de datasheet deben validarse siempre contra la fuente original por una persona.
- No apto para material legal, de seguridad o de cara al cliente tal cual sale del modelo.
- Idioma: solo inglés declarado; el autor lo excluye explícitamente para cualquier otro idioma, incluido el español.
- Fuera de nicho, el comportamiento decae: no está pensado para chat general ni para temas ajenos a semiconductores, interconexión, almacenamiento o DPU.
- Sesgos de dominio: al entrenarse sobre PDFs de proveedores y documentación sintética, puede reproducir el sesgo comercial y la terminología de los fabricantes presentes en el corpus, así como sus omisiones.
- Discrepancia de nomenclatura y contenido: el identificador del repositorio termina en `-LoRA` y las etiquetas incluyen `peft` y `lora`, pero la model card describe este repositorio como los pesos fusionados en fp16 e indica que el adaptador suelto debería estar en `Shankarblr/Llama-3.2-3B-Unsloth-LoRA` y el fusionado en `Shankarblr/Llama-3.2-3B-Unsloth-Instruct`. Conviene inspeccionar el contenido real del repositorio antes de cargarlo (el recuento de 3.212.749.824 parámetros sugiere pesos fusionados, no un adaptador).
- Riesgo de cuantización: el autor recomienda empezar con Q4_K_M y reexportar a q8_0 solo si Ollama estropea cifras o SKUs que el merge en fp16 sí acierta; si el error de familia de producto aparece tanto en fp16 como en Q4, el problema es del dataset, no de la cuantización.
- Plantilla de chat obligatoria: usar la plantilla de Llama 3.2 Instruct; emplear ChatML estilo Qwen produce resultados incorrectos.
- Licencia: Llama 3.2 Community License con condiciones de uso comercial, incluida la obligación de que los nombres de los modelos distribuidos empiecen por `Llama`.
- Madurez y adopción: 0 descargas y 0 likes en el momento de la consulta, entrenamiento sobre un corpus privado no auditable y métricas no verificadas; no es adecuado como componente crítico de producción sin evaluación propia.
- Restricciones de puesta en producción: la calidad depende del prompt de sistema; conviene fijar el rol de redactor técnico y las reglas de coherencia (un nodo de proceso, un throughput, un factor de forma) tal como sugiere la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shankarblr/Llama-3.2-3B-Unsloth-TechWriter-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Pesos base usados en el entrenamiento: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Artefactos relacionados citados en la model card (identificadores sugeridos, no verificados): `Shankarblr/Llama-3.2-3B-Unsloth-Instruct` (fusionado fp16), `Shankarblr/Llama-3.2-3B-Unsloth-LoRA` (adaptador), `Shankarblr/Llama-3.2-3B-Instruct-SFT` (SFT previo con TRL y bitsandbytes)
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (páginas de plantilla de los Minnesota Twins de MLB), por lo que no se han podido incorporar enlaces adicionales relevantes (papers, blogs o demos).
