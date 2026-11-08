# eulermaxwell/analogretriever_H200

## Resumen

AnalogRetriever es un modelo de recuperación cross-modal especializado en circuitos analógicos, desarrollado por Yihan Wang, Lei Li, Yao Lai, Jing Wang y Yan Lu y publicado en el contexto de ICCAD 2026. Resuelve un problema concreto del diseño electrónico asistido: dado un esquemático (imagen), una descripción en inglés o un netlist SPICE, recuperar las otras dos modalidades correspondientes dentro de una base de circuitos. El checkpoint alojado en `eulermaxwell/analogretriever_H200` es la versión histórica que reproduce la Tabla 2 del paper.

Arquitectónicamente no es un modelo generativo, sino un encoder de representaciones: un backbone CLIP ViT-L/14 compartido para imagen y texto, y un encoder de grafos RGCN de dos capas para los netlists SPICE. El resultado son embeddings normalizados de 768 dimensiones en un espacio compartido, lo que permite búsqueda por similitud coseno entre las tres modalidades.

El interés actual radica en que aplica técnicas de visión-lenguaje y graph learning a un dominio tradicionalmente fuera del alcance de los LLM generalistas, con un rendimiento reportado de R@1 medio del 75,2 % en recuperación sobre 200 tripletas muestreadas. El repositorio pesa 10,4 GB, pero el checkpoint principal ocupa 1.764.335.833 bytes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14 compartido (imagen/texto) + RGCN de 2 capas (netlist), embeddings en espacio común |
| Parámetros totales | no disponible (el checkpoint ocupa 1.764.335.833 bytes; el backbone es ViT-L/14) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens para texto (límite de CLIP; el texto se trunca más allá) |
| Tipos de cuantización | no disponible (solo se publica state dict en FP32 PyTorch) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (pesos y código); CLIP, MASALA-CHAI y datos fuente conservan sus términos |
| Formato de pesos | Custom PyTorch state dictionary (`.pth`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo combina tres encoders en un espacio de embedding compartido de 768 dimensiones. Imagen y texto usan un CLIP ViT-L/14 con backbone compartido, mientras que los netlists SPICE se codifican con una red de convolución de grafos relacional (RGCN) de dos capas con dimensión oculta 512, GraphNorm, conexiones residuales y pooling por atención aprendida. El grafo usa un vocabulario fijo de 22 tipos de nodo y 20 relaciones tipadas, suministrado en `train_data_vocab.json`. Durante el entrenamiento conjunto se congelan los 16 bloques inferiores de los 24 del encoder visual.

El dataset refinado contiene 6.371 tripletas (esquemático, descripción, netlist), con split seed-42 de 5.371 ejemplos de entrenamiento y 1.000 reservados. La configuración del paper usa una GPU H200, batch 256, learning rate 5e-5 para CLIP y 5e-4 para el grafo, label smoothing 0,1, ratio de hard negatives de 0,05 a 0,3 y un currículum de 6 épocas de warm-up, 2 de transición y 12 de currículum. No se documenta RLHF ni DPO; el objetivo es de aprendizaje contrastivo de representaciones.

## Capacidades

- Recuperación imagen → código: dado un esquemático, devuelve netlists SPICE candidatos.
- Recuperación texto → imagen: dada una descripción en inglés, devuelve esquemáticos.
- Recuperación texto → código: de descripción a netlist SPICE.
- Recuperación código → imagen y código → texto: desde netlist hacia esquemático o descripción.
- Recuperación imagen → texto: de esquemático a descripción textual.
- Embeddings normalizados de 768 dimensiones aptos para búsqueda por similitud coseno e índices vectoriales.
- Codificación de grafos dirigidos con 22 tipos de nodo y 20 relaciones tipadas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de representación, no generativo.
- Capacidad multilingüe limitada al inglés en la rama de texto.

## Casos de uso

- Búsqueda de circuitos de referencia en bibliotecas internas: indexar los esquemáticos y netlists de una empresa y permitir consultas por descripción textual para localizar topologías reutilizables antes de diseñar desde cero.
- Reconstrucción de netlist a partir de documentación gráfica: dado un esquemático escaneado de un datasheet o paper, recuperar netlists SPICE candidatos para acelerar la simulación.
- Deduplicación y clustering de bibliotecas de circuitos: generar embeddings de las tres modalidades y agrupar variantes topológicas equivalentes o familias relacionadas.
- Asistencia a revisión de diseño: cruzar un netlist nuevo contra el corpus histórico para encontrar esquemáticos y descripciones de circuitos similares y contrastar parámetros de diseño.
- Enriquecimiento de documentación técnica: para un netlist sin descripción, recuperar textos asociados del corpus y usarlos como borrador de documentación.
- Construcción de motores de búsqueda internos para equipos de diseño analógico: desplegar el encoder sobre un índice vectorial (FAISS, Milvus) y ofrecer búsqueda multimodal vía API.
- Investigación en representaciones cross-modal para EDA: servir como baseline reproducible (checkpoint y commit fijados) para comparar nuevos métodos de recuperación de circuitos.

## Benchmarks y rendimiento

Resultados reportados en la Tabla 2 del paper. Cada prueba muestrea 200 tripletas reservadas como consultas y candidatos; las puntuaciones promedian 10 extracciones con semilla del pool reservado de 1.000 ítems.

| Dirección | R@1 (%) | R@5 (%) | R@10 (%) |
|---|---:|---:|---:|
| Imagen → Código | 74,7 | 95,5 | 98,1 |
| Texto → Imagen | 78,2 | 96,8 | 97,9 |
| Texto → Código | 75,6 | 96,3 | 98,6 |
| Código → Imagen | 72,0 | 94,8 | 97,9 |
| Imagen → Texto | 78,5 | 96,7 | 98,3 |
| Código → Texto | 72,4 | 96,7 | 98,3 |

R@1 medio: 75,2 %. La recuperación completa sobre 1.000 candidatos se reporta por separado en el paper. No se dispone de comparativas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa aproximadamente 1,76 GB en FP32; en inferencia con backbone CLIP ViT-L/14 y RGCN, se estima un consumo moderado, aunque no se publica una cifra oficial de VRAM.
- GPU recomendadas: el paper entrena en NVIDIA H200; para evaluación, cualquier GPU CUDA con memoria suficiente para CLIP ViT-L/14 (por ejemplo, A100, RTX 4090, RTX 3090) debería bastar.
- Evaluación en CPU: el evaluador oficial admite `--device cpu --batch_size 4`, por lo que es viable sin GPU con mayor latencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 y superiores; no se publica la VRAM exacta.
- Opciones de despliegue: no hay soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo). Se usa el código oficial de `AnalogRetriever_ICCAD` con PyTorch 3.10+, PyTorch Geometric y OpenAI CLIP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de recuperación cross-modal específicos para circuitos analógicos. Como referencia estructural, el backbone es CLIP ViT-L/14, pero AnalogRetriever añade la rama de grafos y el entrenamiento específico de dominio, por lo que no es directamente intercambiable.

| Modelo | Modalidades | Contexto texto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AnalogRetriever (este) | Imagen, texto, netlist SPICE | 77 tokens | MIT | Hugging Face + GitHub |
| CLIP ViT-L/14 (base) | Imagen, texto | 77 tokens | MIT (OpenAI) | Hugging Face |
| Alternativas de recuperación de circuitos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El dataset se centra en circuitos analógicos de estilo libro de texto; puede incluir familias topológicas y de fuente relacionadas entre splits, lo que puede inflar las métricas de recuperación.
- Los circuitos recuperados requieren validación eléctrica y de esquemático antes de reutilizarse; el modelo no verifica corrección funcional.
- Las descripciones de más de 77 tokens se truncan por el límite de contexto de CLIP.
- Solo inglés en la rama de texto.
- Es un modelo de recuperación, no generativo: no produce netlists, esquemáticos ni explicaciones.
- Requiere el vocabulario de grafo fijo (22 nodos, 20 relaciones) y la implementación histórica del commit `882f49d`; otras versiones del código pueden ser incompatibles.
- Licencia MIT en pesos y código, pero CLIP, dependencias, esquemáticos MASALA-CHAI y datos fuente conservan sus propios términos (ver `docs/THIRD_PARTY.md` y la model card del dataset).
- Riesgo de falsos positivos en recuperación por similitud: embeddings cercanos no garantizan equivalencia funcional.
- Sin descargas ni likes registrados en Hugging Face en el momento de la consulta; ecosistema de soporte muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulermaxwell/analogretriever_H200
- Modelo relacionado: https://huggingface.co/eulermaxwell/AnalogRetriever-model
- Paper (DOI): https://doi.org/10.1145/3831252.3834253
- Código: https://github.com/yihan-wa/AnalogRetriever_ICCAD
- Commit del código: https://github.com/yihan-wa/AnalogRetriever_ICCAD/tree/882f49da57db8f4c00e79d1c07a6c9b977b684c1
- Notas de reproducibilidad: https://github.com/yihan-wa/AnalogRetriever_ICCAD/blob/main/docs/REPRODUCIBILITY.md
- Dataset: https://huggingface.co/datasets/eulermaxwell/AnalogRetriever-data
