# nchapman/qwen3.5-2b-summarization-lora

## Resumen

Qwen3.5-2B Summarization LoRA es un adaptador PEFT de tipo LoRA, con rango 16 y alpha 16, entrenado por el usuario nchapman sobre el modelo base Qwen/Qwen3.5-2B. No es un modelo independiente: requiere cargar el modelo base de 2 mil millones de parametros y aplicar el adaptador encima. Su proposito es reforzar un contrato de respuesta especifico para el resumen de documentos web y articulos periodisticos en ingles, priorizando prosa objetiva y concisa.

El adaptador se entreno sobre pares documento-resumen provenientes del split de summarization SFT de HuggingFaceTB/smoltalk2 (que incluye estilos de una linea y de tres frases) y de pares privados del autor. El checkpoint evaluado es el 128 de una ejecucion de 512 actualizaciones. El repositorio ocupa 0,1 GB y se distribuye en formato safetensors bajo licencia Apache-2.0, mientras que el modelo base conserva su propia licencia.

Su relevancia actual es doble: por un lado, demuestra un flujo de trabajo de ajuste fino ligero sobre un modelo pequeno de la familia Qwen3.5; por otro, publica una evaluacion comparativa con intervalos de confianza pareados sobre 250 articulos de CNN/DailyMail, con resultados mixtos que el propio autor reconoce como no concluyentes en calidad global. Es un ejemplo de transparencia metodologica mas que un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-2B |
| Parametros totales | no disponible (adaptador; el modelo base tiene 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | BF16 para el adaptador; el modelo base se evaluo en Q4 (GGUF) y BF16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (adaptador); el modelo base conserva su licencia |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 16 y dropout 0, aplicado sobre el modelo base Qwen3.5-2B. Se entreno durante 512 actualizaciones y el checkpoint evaluado es el 128. Los ejemplos de entrenamiento emparejan un documento fuente con su resumen objetivo; la parte publica del dataset proviene del split de summarization SFT de HuggingFaceTB/smoltalk2, con estilos de resumen de una linea y de tres frases, y las ejecuciones mixtas incorporaron pares privados de documento web y resumen del autor. Ambos tamanos de Qwen usaron el mismo pool preparado congelado y las mismas asignaciones de entrenamiento y validacion.

El objetivo declarado del ajuste es reforzar un contrato de respuesta compartido (prosa plana objetiva, breve si la fuente es simple y mas detallada si lo merece) de forma consistente entre tamanos de modelo. El autor advierte explicitamente que esta es una direccion pretendida y no un resultado de normalizacion demostrado: no se ejecuto ninguna metrica formal de varianza de estilo entre modelos, y los cambios en longitud y calidad dependen del modelo. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, ni detalles sobre RLHF o DPO en el adaptador.

## Capacidades

- Generacion de resumen extractivo y abstractivo de articulos periodisticos y documentos web en ingles.
- Produccion de resumenes en distintos niveles de detalle: desde una linea hasta parrafos mas extensos, segun la complejidad de la fuente.
- Prosa objetiva orientada a hechos, con enfasis en factualidad segun la evaluacion publicada.
- Compatibilidad con la plantilla de chat del modelo base Qwen3.5-2B.
- Capacidades heredadas del modelo base (razonamiento, codigo, matematicas, multilingue) potencialmente preservadas, aunque no evaluadas en la model card.
- No se documenta soporte especifico de tool calling, function calling ni comportamiento agentico en el adaptador.

## Casos de uso

- Resumen de articulos de prensa en ingles: el adaptador esta entrenado y evaluado sobre CNN/DailyMail, por lo que encaja en pipelines de agregacion de noticias que necesiten condensar piezas de forma objetiva.
- Generacion de resumenes de paginas web corporativas o documentacion interna: el entrenamiento incluye pares de documento web y resumen, lo que lo hace adecuado para destilar contenido de sitios y bases de conocimiento.
- Preprocesado para sistemas RAG: condensar documentos largos antes de indexarlos o de pasarlos a un modelo mayor reduce coste de tokens y mejora la densidad informativa de los embeddings.
- Resumenes de una linea para boletines o feeds: el dataset de entrenamiento incluye ese estilo, util para titulares o descripciones cortas automatizadas.
- Prototipado y experimentacion academica: al ser un adaptador pequeno (0,1 GB) sobre un modelo de 2B, permite iterar rapidamente en entornos con recursos limitados y comparar el efecto del ajuste frente al modelo base.
- Evaluacion de contratos de estilo entre tamanos de modelo: el autor lo plantea como herramienta para estudiar la consistencia de respuestas entre variantes de Qwen, util en investigacion sobre normalizacion de salidas.

## Benchmarks y rendimiento

Evaluacion alineada sobre 250 articulos de CNN/DailyMail, inferencia del base en Q4, adaptador en BF16, decodificacion greedy comun (`summary-v3`) y el mismo juez fijado para los cuatro pares base/adaptador:

| Metrica | Base | Base + adaptador | Diferencia [IC 95% pareado] |
|---|---:|---:|---:|
| Factualidad (juez, 1-5) | 3,576 | 4,520 | +0,944 [+0,808, +1,076] |
| Cobertura (juez, 1-5) | 4,148 | 4,024 | -0,124 [-0,244, -0,004] |
| Legibilidad (juez, 1-5) | 4,204 | 3,992 | -0,212 [-0,352, -0,080] |
| Calidad global (juez, 1-5) | 3,548 | 3,596 | +0,048 [-0,096, +0,184] |
| ROUGE-L | 0,1372 | 0,1599 | +0,0226 [+0,0137, +0,0316] |
| Palabras medias | 310,6 | 342,4 | +31,9 [+3,1, +61,0] |
| Paradas por tope de 1.024 tokens | 3 | 29 | +26 |

La factualidad y el solapamiento con la referencia mejoran de forma estadisticamente significativa, mientras que cobertura y legibilidad empeoran. La calidad global es inconcluyente (el intervalo cruza cero). Las paradas por limite de contexto aumentan de 3 a 29, lo que indica resumenes mas largos y mayor riesgo de truncamiento. El autor senala que este resultado sustituye a una instantanea anterior con distinta configuracion de decodificacion.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa 0,1 GB; el modelo base de 2B en BF16 requiere aproximadamente 4-5 GB, y en Q4 alrededor de 1,5-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente para el modelo base en BF16 o Q4; para mayor throughput, A100 o H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 6 GB o mas en BF16 y con 3-4 GB en cuantizacion Q4.
- Opciones de despliegue: Transformers con PEFT (requiere una version que soporte Qwen3.5; el autor uso Transformers 5.2.0), llama.cpp u Ollama para el base cuantizado, vLLM o TGI para servir el base con el adaptador si la integracion lo permite.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchapman/qwen3.5-2b-summarization-lora | 2B (base) + LoRA r16 | no disponible | Resumen en ingles | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Proposito general | Licencia propia de Qwen | Hugging Face |
| Adaptadores de resumen sobre modelos pequenos (genericos) | variable | variable | Resumen | variable | Hugging Face |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada; la unica comparacion cuantitativa disponible es la del propio autor frente al modelo base.

## Limitaciones y advertencias

- Resultado mixto: mejora factualidad y ROUGE-L pero empeora cobertura y legibilidad, y la calidad global no es concluyente. No es una mejora incondicional.
- Evaluacion limitada a una sola semilla y un solo checkpoint (128 de 512) sobre un conjunto publico de noticias expuesto; la generalizacion a otros dominios no esta demostrada.
- Aumento notable de paradas por el tope de 1.024 tokens (de 3 a 29), lo que puede producir resumenes truncados en produccion.
- Solo ingles; no se evalua ni se declara soporte multilingue.
- Riesgo de alucinacion inherente al modelo base, parcialmente mitigado en la muestra evaluada pero no eliminado.
- El adaptador no es un modelo autonomo: requiere el modelo base y una version de Transformers compatible con Qwen3.5 y PEFT.
- Licencia Apache-2.0 para el adaptador, pero el modelo base conserva su propia licencia y terminos, que deben revisarse antes de uso comercial.
- No se incluyen en el repositorio los registros privados, los ficheros de entrenamiento derivados ni el runner de entrenamiento, lo que limita la reproducibilidad completa.
- No se documentan sesgos especificos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/nchapman/qwen3.5-2b-summarization-lora
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset smoltalk2 (HuggingFaceTB): https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Informe de evaluacion completo: `docs/results/aligned-adapter-comparison.md` en el repositorio Lillm Summarizer del autor (no se proporciona URL directa en la informacion disponible)
