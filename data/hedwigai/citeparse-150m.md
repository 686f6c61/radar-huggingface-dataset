# hedwigai/citeparse-150m

## Resumen

citeparse-150m es un modelo encoder de tipo ModernBERT especializado en la extraccion de campos estructurados a partir de cadenas de referencia bibliografica. Desarrollado por hedwigai, toma como base jhu-clsp/ettin-encoder-150m y se reentrena mediante clasificacion de tokens BIO sobre 16 etiquetas para identificar autores, titulo, contenedor, fecha, volumen, numero, paginas y DOI, entre otros campos. El modelo es la variante grande del paquete de codigo abierto citeparse, que convierte esas etiquetas en CSL-JSON o BibTeX.

El problema que resuelve es la normalizacion de bibliografias en pipelines academicos: en lugar de depender de GROBID (basado en CRF), ofrece un parser neuronal compacto de 149,6 millones de parametros que corre en CPU a unas 20 referencias por segundo con 8 hilos. Su relevancia practica esta en que supera a GROBID en referencias reales de Crossref no vistas en entrenamiento, con un 95,2 % de campos correctos y un 83,4 % de referencias completamente correctas.

Arquitectura ModernBERT encoder-only, licencia Apache-2.0, solo ingles y entrenamiento de una unica epoca sobre un corpus derivado de GROBID y registros Crossref reescritos en 11 estilos de citacion. No es un modelo generativo: no produce texto libre, solo etiquetas por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder-only (base jhu-clsp/ettin-encoder-150m) |
| Parametros totales | 149.630.241 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte del encoder ModernBERT de 150M de jhu-clsp (ettin-encoder-150m) y se afina como clasificador de tokens con esquema BIO sobre 16 etiquetas. La tarea es token-classification: cada token de una referencia recibe una etiqueta que indica a que campo bibliografico pertenece. El paquete citeparse traduce despues esas etiquetas a CSL-JSON o BibTeX.

El entrenamiento consistio en una sola epoca sobre dos fuentes: el corpus de citaciones de GROBID (Apache-2.0), tras eliminar sus ficheros de evaluacion y cualquier referencia que aparezca en ellos, y registros de Crossref (CC0) renderizados en 11 estilos de citacion con ruido de teclado. El codigo de entrenamiento esta publicado en el repositorio github.com/un-seen/citeparse/tree/main/train. No se menciona RLHF, DPO ni decodificacion especulativa; es un modelo discriminativo puro.

## Capacidades

- Extraccion de campos de referencias bibliograficas: autores, titulo, contenedor, fecha, volumen, numero, paginas, DOI y 8 campos adicionales (16 etiquetas BIO en total).
- Conversion de etiquetas a CSL-JSON y BibTeX mediante el paquete citeparse.
- Procesamiento por referencia individual: etiqueta una cadena de referencia a la vez.
- Ejecucion en CPU con buen throughput (unas 20 referencias por segundo con 8 hilos).
- Alternativa ligera a GROBID en pipelines de bibliografia.
- No soporta tool calling, agentes, vision, audio ni generacion de texto.
- Capacidad multilingue limitada: entrenado solo con estilos en ingles.

## Casos de uso

- Normalizacion de bibliografias en repositorios academicos: dado un listado de referencias en texto plano, el modelo extrae los campos y el paquete citeparse los serializa a CSL-JSON para su integracion en gestores de referencias.
- Migracion de bibliografias a BibTeX: util para convertir listas de referencias extraidas de PDFs o webs a formato BibTeX reutilizable en LaTeX, con un 83,4 % de referencias completamente correctas en el benchmark.
- Enriquecimiento de metadatos en bases de datos cientificas: identificar DOI, titulo y contenedor de referencias sueltas para cruzarlas con registros Crossref.
- Sustitucion de GROBID en entornos con CPU limitada: al correr a unas 20 referencias por segundo en 8 hilos, encaja en servicios donde no hay GPU disponible.
- Preprocesado para pipelines de mineria de citas: etiquetar referencias antes de analisis de redes de citacion o deduplicacion.
- Validacion de bibliografias en flujos editoriales: detectar referencias mal formadas comparando los campos extraidos con el registro Crossref del DOI citado.
- Extraccion por lotes desde ficheros de texto: la CLI `citeparse refs.txt --bibtex --model hedwigai/citeparse-150m` procesa listados completos de referencias.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 700 referencias reales de Crossref, ninguna presente en entrenamiento, evaluadas contra el registro Crossref de la obra citada. GROBID recibio la misma regla de DOI que citeparse.

| Parser | Todos los campos | Referencias totalmente correctas | Titulo | Contenedor |
|---|---|---|---|---|
| GROBID 0.8.1 (CRF) | 0.911 | 71,1 % | 0.882 | 0.805 |
| citeparse-32m | 0.939 | 80,3 % | 0.921 | 0.858 |
| citeparse-150m | 0.952 | 83,4 % | 0.934 | 0.878 |

En el conjunto de validacion propio de GROBID, GROBID obtiene 0.943 frente a 0.890 de citeparse-150m; segun el autor, esas citaciones provienen de las mismas fuentes que los datos de entrenamiento de GROBID. Velocidad en CPU (8 hilos): aproximadamente 20 referencias por segundo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por tamano (149,6 M de parametros) es un modelo pequeno que en fp32 ocupa del orden de 0,6 GB de pesos, pero no se confirma ningun requisito oficial.
- GPU recomendadas: no disponible; el autor destaca el rendimiento en CPU, no en GPU.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano, aunque no hay dato oficial.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles; el paquete citeparse se instala con `pip install citeparse` y acepta el identificador del modelo como argumento. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 20 referencias por segundo en CPU con 8 hilos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | Todos los campos (citeparse-wild-700) | Referencias totalmente correctas | Licencia |
|---|---|---|---|---|---|---|
| citeparse-150m | ModernBERT encoder | 149,6 M | Token classification neuronal | 0.952 | 83,4 % | Apache-2.0 |
| citeparse-32m | Encoder pequeno | no disponible (nombre indica 32 M) | Token classification neuronal | 0.939 | 80,3 % | no disponible |
| GROBID 0.8.1 | CRF | no disponible | Etiquetado secuencial clasico | 0.911 | 71,1 % | no disponible |

## Limitaciones y advertencias

- Entrenado unicamente con estilos de citacion en ingles; el rendimiento con referencias en otros idiomas no esta caracterizado.
- Procesa una referencia por vez: es necesario dividir la bibliografia en lineas antes de pasarla al modelo.
- La abreviatura "et al." se etiqueta como un autor literal, no se expande ni se interpreta.
- Riesgo de alucinacion no aplica en sentido generativo, pero puede asignar etiquetas incorrectas a campos ambiguos; el 16,6 % de referencias no queda completamente correcto en el benchmark.
- En el conjunto de validacion propio de GROBID rinde peor que GROBID (0.890 frente a 0.943), lo que sugiere sensibilidad a la distribucion de datos.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones de las fuentes de datos (corpus GROBID Apache-2.0, Crossref CC0) en despliegues derivados.
- No es un modelo generativo ni soporta tool calling, agentes o multimodalidad; su uso queda acotado al parsing de referencias.

## Enlaces

- Hugging Face: https://huggingface.co/hedwigai/citeparse-150m
- Repositorio del paquete y codigo de entrenamiento: https://github.com/un-seen/citeparse
- Codigo de entrenamiento: https://github.com/un-seen/citeparse/tree/main/train
- Dataset de evaluacion: hedwigai/citeparse-wild-700 (referenciado en la model card)
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-150m
