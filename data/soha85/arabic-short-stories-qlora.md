# Soha85/arabic-short-stories-qlora

## Resumen

`Soha85/arabic-short-stories-qlora` es un ajuste fino por QLoRA del modelo Qwen2.5-0.5B, publicado por el usuario Soha85 en HuggingFace, orientado a la generación de relatos cortos en árabe a partir de un prompt inicial. El modelo se entrenó sobre el dataset `alielfilali01/Darija-Stories-Dataset` y se distribuye en formato transformers/safetensors con licencia declarada como "cc". Se trata, por tanto, de un experimento de ajuste sobre un modelo base muy pequeño (0,5 B de parámetros) y no de un modelo entrenado desde cero.

La relevancia práctica es limitada pero concreta: el ecosistema de modelos abiertos para árabe y, sobre todo, para dariya marroquí, es mucho más reducido que el de inglés o castellano, y los modelos de 0,5 B permiten inferencia en CPU, en GPUs de gama baja y en dispositivos con recursos muy restringidos. Un ajuste de este tamaño puede ser útil como banco de pruebas para técnicas de QLoRA, como generador de datos sintéticos de relatos o como componente creativo en aplicaciones offline.

No obstante, la model card es la plantilla autogenerada por HuggingFace con la mayoría de campos sin cumplimentar ("[More Information Needed]"), el repositorio declara 0 descargas y 0 likes, y el tamaño del repo aparece como 0.0 GB. Todo ello indica que el artefacto es experimental y no ha sido validado ni evaluado de forma pública. La información técnica disponible sobre el ajuste es mínima y la mayor parte de los datos de arquitectura y contexto proceden del modelo base, no de este fine-tune.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajustado con QLoRA sobre Qwen2.5-0.5B |
| Parametros totales | No especificado para el fine-tune; el modelo base Qwen/Qwen2.5-0.5B declara 0,49 B (494 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-0.5B soporta 32 768 tokens (hasta 131 072 con extension YaRN, segun la documentacion de Qwen) |
| Tipos de cuantizacion | Entrenamiento en QLoRA (cuantizacion de 4 bits del modelo base); pesos publicados en safetensors. No se detallan otras variantes (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Arabe (`ar`) declarado en la model card y en los tags. El dataset de entrenamiento es `Darija-Stories-Dataset`, lo que sugiere presencia de dariya marroqui junto a arabe estandar |
| Licencia | "cc" (sin version ni variante especificada); el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El fine-tune parte de Qwen2.5-0.5B, un transformer decoder-only de la familia Qwen2 con normalizacion RMSNorm, activacion SwiGLU, embeddings posicionales rotatorios (RoPE) y atencion con query/key-value grouped attention (GQA). Segun la configuracion publica del modelo base, cuenta con 24 capas, dimension oculta de 896, 14 cabezas de atencion y 2 cabezas KV, con un vocabulario de 151 936 tokens. El ajuste se realizo con QLoRA, es decir, se cuantiza el modelo base a 4 bits y se entrenan adaptadores de bajo rango, lo que reduce drasticamente los requisitos de memoria del entrenamiento.

La model card no aporta ningun detalle sobre el procedimiento: no se indican hiperparametros (rango de LoRA, alpha, learning rate, epochs, precision mixta), ni el numero de tokens de entrenamiento, ni la composicion o el filtrado del dataset `alielfilali01/Darija-Stories-Dataset`. Tampoco se especifica si hubo etapas de alineacion posteriores (SFT, DPO, RLHF) ni si se aplico un chat template especifico. La metrica declarada en los tags es perplejidad, pero no se publica ningun valor. El unico dato cualitativo aportado por el autor es que el modelo "sigue alucinando" (`Still hallucinating`), reconocido explicitamente en la seccion de sesgos y limitaciones.

## Capacidades

- Generacion de texto en arabe: el caso de uso declarado es producir relatos cortos a partir de una frase o prompt inicial.
- Generacion creativa de ficcion breve: cuentos, microrelatos y continuaciones narrativas.
- Cobertura potencial de dariya marroqui, dado el dataset de entrenamiento utilizado, ademas de arabe estandar (no confirmado por el autor).
- Inferencia ligera: 0,5 B de parametros permiten ejecucion en CPU y en hardware muy modesto.
- Capacidad conversacional declarada en los tags (`conversational`), aunque sin plantilla de chat documentada.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo "thinking". Estas capacidades no se mencionan en la informacion disponible.

## Casos de uso

- Generacion de cuentos infantiles en arabe: el modelo recibe una premisa breve ("un nino y una linterna") y produce un relato de pocos parrafos; su tamano permite integrarlo en una app movil o web sin coste de GPU.
- Prototipado rapido de narrativa en dariya: util para equipos que quieran generar borradores de contenido dialectal marroqui y revisarlos manualmente antes de publicar.
- Aumento de datos para entrenamiento: usar el modelo para producir variantes sinteticas de relatos cortos que amplien un corpus arabe de ficcion, con filtrado y revision humana posteriores.
- Experimentacion academica con QLoRA: sirve como referencia reproducible de ajuste de bajo rango sobre un modelo de 0,5 B en una unica GPU consumer o incluso en CPU con suficiente tiempo.
- Generacion offline en entornos sin conectividad: al caber en memoria de un portatil o una Raspberry Pi (con cuantizacion adecuada), puede desplegarse en contextos educativos o de campo sin acceso a la nube.
- Apoyo a la ensenanza de arabe: generar textos cortos graduados por dificultad para ejercicios de lectura, siempre con supervision docente.
- Base para experimentos de estilistica: comparar el estilo narrativo aprendido del dataset con el del modelo base sin ajustar, para estudiar el efecto del QLoRA en un corpus pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la perplejidad como metrica en los tags, pero la seccion de evaluacion esta vacia ("[More Information Needed]") y no se proporciona ningun valor de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de arabe.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 para los pesos de un modelo de 0,5 B, mas cache KV; en torno a 0,4-0,6 GB con cuantizacion de 4 bits. Cifras estimadas a partir del tamano del modelo base, no verificadas para este checkpoint.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 4090, RTX 3090, RTX 4060 o incluso una GTX 1650 con 4 GB son suficientes. Para despliegues de servidor, A100/H100 no aportarian ventaja significativa por el reducido tamano del modelo.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU con 4 GB o mas de VRAM, y en CPU con memoria RAM suficiente (menos de 2 GB en fp32).
- Opciones de despliegue: transformers (via `pipeline` de text-generation), vLLM, TGI, llama.cpp y Ollama (estos dos ultimos requeririan convertir los pesos a GGUF, ya que no se publican variantes GGUF). Tambien es viable ONNX Runtime para despliegue en navegador o edge.
- Latencia y throughput: no disponibles. En una GPU consumer se puede esperar una generacion muy rapida por el reducido numero de parametros, pero no hay mediciones publicadas.
- Advertencia: el repositorio declara un tamano de 0.0 GB, lo que sugiere que podria contener unicamente los adaptadores LoRA y no los pesos fusionados. Conviene verificar los archivos disponibles antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Soha85/arabic-short-stories-qlora | 0,49 B (base) | No disponible en la model card (base: 32 768 tokens) | Generacion de relatos en arabe/dariya via QLoRA | "cc" (sin especificar) | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-0.5B | 0,49 B | 32 768 tokens (131 072 con YaRN) | Modelo base generalista multilingue | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Qwen/Qwen2.5-1.5B | 1,5 B | 32 768 tokens (131 072 con YaRN) | Modelo generalista, mayor capacidad | Apache 2.0 | HuggingFace |
| AraGPT2-base | ~0,135 B | 1 024 tokens | Modelo GPT-2 entrenado en arabe | MIT (segun su model card) | HuggingFace |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este fine-tune, y los modelos alternativos no se han evaluado en las mismas condiciones en la informacion disponible. A igualdad de parametros, Qwen2.5-0.5B ofrece un contexto nativo muy superior al de AraGPT2 y un vocabulario mas amplio, pero carece de especializacion en arabe; el fine-tune de Soha85 aporta esa especializacion a costa de perder capacidades generales y sin evidencia de evaluacion.

## Limitaciones y advertencias

- Alucinacion reconocida por el propio autor ("Still hallucinating"): el modelo puede inventar hechos, nombres o tramas incoherentes, especialmente en generaciones largas.
- Tamano muy reducido (0,5 B): coherencia narrativa limitada, tendencia a repetir, a perder el hilo y a degradarse mas alla de unos cientos de tokens.
- Idiomas: solo se declara arabe. El dataset de entrenamiento es de dariya (dialecto marroqui), lo que puede producir mezcla de registros o un arabe estandar poco cuidado; no hay evaluacion de calidad por variedad dialectal.
- Sesgos: no documentados. Al entrenarse sobre un corpus de relatos sin filtrado descrito, puede reproducir estereotipos presentes en el dataset original.
- Licencia ambigua: "cc" sin version ni variante (BY, BY-SA, BY-NC...). Esto impide determinar con certeza si el uso comercial esta permitido. Ademas, el modelo base Qwen2.5-0.5B es Apache 2.0, cuyas condiciones deben respetarse igualmente.
- Ausencia total de evaluacion: sin benchmarks, sin perplejidad publicada, sin pruebas de calidad. No es recomendable para produccion sin una evaluacion propia previa.
- Repositorio practicamente vacio en cuanto a documentacion y con 0 descargas: no hay senal de uso comunitario ni de mantenimiento.
- Formato: no se publican pesos en GGUF ni cuantizaciones listas para llama.cpp u Ollama; habria que generarlas.
- Model card autogenerada: los campos de uso, datos, hiperparametros y evaluacion estan sin rellenar, lo que impide reproducir el entrenamiento.
- Riesgo de contaminacion o sobreajuste al dataset, imposible de valorar sin conocer la composicion y el tamano del corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Soha85/arabic-short-stories-qlora
- Repositorio de archivos: https://huggingface.co/Soha85/arabic-short-stories-qlora/tree/main
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/alielfilali01/Darija-Stories-Dataset
- Referencia citada en los tags (Lacoste et al., 2019, sobre impacto ambiental de ML): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact#compute
- Paper y demo del modelo: no disponibles ("Still Working on", segun la model card)
