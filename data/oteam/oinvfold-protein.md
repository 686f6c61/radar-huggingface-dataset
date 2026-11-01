# oteam/oinvfold-protein

## Resumen

OInvFold es un conjunto de modelos de grafos geométricos disenados para la predicción de identidades en biología estructural, concretamente para *inverse folding* de polímeros (proteínas, ADN y ARN) y para la asignación provisional de elementos atómicos en ligandos a partir de coordenadas fijas. El modelo lo desarrollan los autores de ODesign (The Institute for AI Molecular Design) y esta ficha concreta corresponde a la variante de proteínas, publicada en HuggingFace por el equipo OFoldX como implementación no oficial bajo la librería `ofoldx`.

El problema que resuelve es el inverso al plegamiento: dado un esqueleto tridimensional fijo, predecir la secuencia de aminoácidos que lo genera. Esto es útil en diseno computacional de proteínas, donde se parte de una estructura deseada y se necesita una secuencia viable. La variante de proteínas emplea un modelo de grafos con paso de mensajes geométrico, 12 bloques de encoder, tamaño oculto de 128 y 4 cabezas de atención, con un total de 8.374 millones de parámetros (8.390.209 según los pesos en safetensors).

Es relevante ahora porque forma parte del ecosistema ODesign, presentado como un *world model* para diseno de interacciones biomoleculares, y porque la implementación OFoldX expone operaciones diferenciables de `encode` y `forward` que permiten integrar el modelo en pipelines de diseno y evaluación. La licencia AGPL-3.0 y el aviso explícito del equipo OFoldX sobre discrepancias en la preparación de features son factores críticos a considerar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de grafos geométricos con paso de mensajes (12 bloques de encoder, hidden size 128, 4 cabezas de atención, 32 átomos virtuales) |
| Parametros totales | 8.390.209 (aproximadamente 8,39 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo sobre estructura, no sobre secuencia de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; opera sobre estructuras moleculares) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OInvFold emplea un modelo de grafos geométricos con paso de mensajes sobre las coordenadas atómicas. Cada bloque del encoder aplica corrupción de grafo durante el entrenamiento, lo que actúa como regularización y obliga al modelo a reconstruir información estructural a partir de vecindarios parciales. La variante de polímeros produce 25 clases de salida (los tipos de residuo) y decodifica secuencias moleculares mediante búsqueda greedy o beam search, devolviendo candidatos con sus log-probabilidades totales y medias.

El entrenamiento se realizó como parte del proyecto ODesign; los detalles de composición del dataset, número de tokens o estructuras y el proceso de curado de datos no se especifican en la model card y remiten al paper de ODesign. La librería OFoldX expone operaciones diferenciables de `encode` y `forward`, así como `OInvFoldLoss` para verosimilitud negativa enmascarada de polímeros, pero la orquestación completa del entrenamiento y la construcción del dataset quedan a cargo de la aplicación. No se documenta RLHF, DPO ni decodificación especulativa.

Un caveat técnico relevante: OFoldX usa nodos globales virtuales basados en centroides con rotaciones y traslaciones relativas reales, mientras que la preparación de polímeros publicada suministra features globales constantes de identidad/cero. Esto altera las predicciones del checkpoint y exige una evaluación separada de la calidad de inferencia.

## Capacidades

- Predicción de secuencia de proteínas (*inverse folding*) a partir de un esqueleto tridimensional fijo en formato CIF.
- Decodificación greedy (un candidato) y beam search (varios candidatos ordenados por rango) con log-probabilidades.
- Modelos separados para ADN y ARN (variantes `oinvfold-dna` y `oinvfold-rna`) con la misma arquitectura de polímero.
- Asignación provisional de elementos atómicos en ligandos (variante `oinvfold-ligand`, 37 clases de salida, 6,429 M de parámetros).
- Operaciones diferenciables de `encode` y `forward` para integración en pipelines de entrenamiento o evaluación.
- Ejecución por etapas con `prepare`, `forward` y `postprocess` en la pipeline de OFoldX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Diseno computacional de proteínas *de novo*: partiendo de una estructura backbone deseada, el modelo genera secuencias candidatas que pueden filtrarse por log-probabilidad y validarse posteriormente con predictores de plegamiento.
- Rediseno de secuencias manteniendo el esqueleto: útil para aumentar estabilidad o solubilidad de una proteína sin alterar su arquitectura tridimensional.
- Generación de librerías de variantes: el beam search con `num_beams` configurable permite producir múltiples candidatos ordenados por probabilidad para cribados experimentales.
- Integración en pipelines de diseno con evaluación diferenciable: las operaciones `encode`/`forward` y `OInvFoldLoss` permiten usar el modelo dentro de bucles de optimización o *fine-tuning* supervisado.
- Diseno de ácidos nucleicos (variantes ADN/ARN): generación de secuencias compatibles con estructuras tridimensionales fijas para aplicaciones en biología sintética.
- Asignación provisional de elementos en ligandos: a partir de coordenadas atómicas conocidas, obtener una hipótesis inicial de identidad elemental que después debe completarse con topología de enlaces y cargas formales.
- Prototipado e investigación en *inverse folding*: al ser una implementación no oficial con código abierto, sirve como base para reproducir y extender los experimentos de ODesign.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 8,39 M de parámetros en precisión nativa, el modelo es muy ligero (del orden de decenas de MB de pesos), pero el consumo real depende del tamaño de la estructura de entrada y del grafo construido.
- GPU recomendadas: no se especifican. Dado el tamano, cualquier GPU moderna debería poder ejecutarlo; no se documenta soporte específico para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: muy probablemente sí, por el reducido número de parámetros, aunque no hay confirmación oficial ni cifras de memoria pico.
- Opciones de despliegue: la librería `ofoldx` (instalable con `pip install ofoldx`) es la vía documentada. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OInvFold (protein) | 8,39 M | No aplica | Inverse folding de proteínas | AGPL-3.0 | HuggingFace (implementación no oficial OFoldX) |
| OInvFold (ligand) | 6,43 M | No aplica | Asignación de elementos en ligandos | AGPL-3.0 | HuggingFace (implementación no oficial OFoldX) |
| OInvFold (DNA/RNA) | No disponible | No aplica | Inverse folding de ácidos nucleicos | AGPL-3.0 | HuggingFace (implementación no oficial OFoldX) |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con otras herramientas de *inverse folding*.

## Limitaciones y advertencias

- Implementación no oficial: la model card la escribe el equipo OFoldX, no los autores originales de OInvFold, y la calidad de inferencia requiere evaluación independiente.
- Discrepancia en features globales: OFoldX usa nodos virtuales con rotaciones/traslaciones reales, mientras que la preparación publicada usa features constantes; esto cambia las predicciones del checkpoint.
- La salida de ligandos es provisional: no resuelve topología de enlaces, cargas formales ni identidad canónica de componentes químicos.
- Sin datos de benchmarks publicados: no hay evidencia cuantitativa de rendimiento en la información disponible.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere liberar el código modificado, lo que puede ser incompatible con productos propietarios.
- Sesgos y alucinación: no documentados; al ser un modelo estructural, el riesgo principal es generar secuencias no plegables o no funcionales, no "alucinación" en sentido lingüístico.
- Limitaciones de idioma y contexto: no aplica, pero tampoco hay soporte para tareas de texto.
- Detalles de entrenamiento y datos no disponibles en la model card; dependen del paper de ODesign.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/oinvfold-protein
- Variante ADN: https://huggingface.co/oteam/oinvfold-dna
- Variante ARN: https://huggingface.co/oteam/oinvfold-rna
- Variante ligando: https://huggingface.co/oteam/oinvfold-ligand
- Paper ODesign: https://arxiv.org/abs/2510.22304
- Repositorio oficial ODesign: https://github.com/The-Institute-for-AI-Molecular-Design/ODesign
- Código OFoldX del modelo: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/oinvfold
- Guía de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Documentación de la librería: https://ofoldx.valtech.ai/
