# oteam/odesign-ligand-rigid

## Resumen

ODesign es un modelo de difusión al-átomo para el diseño de interacciones biomoleculares, desarrollado originalmente por Odin Zhang, Xujun Zhang, Haitao Lin et al. y publicado en el preprint arXiv:2510.22304. La variante `oteam/odesign-ligand-rigid` es una implementación no oficial distribuida por el equipo OFoldX dentro de la librería `ofoldx`, y se centra en la generación provisional de coordenadas de ligando con contexto de receptor rígido seguida de asignación de elementos químicos.

El modelo resuelve el problema inverso al plegamiento: dado un bolsillo de unión observado en un complejo receptor, genera coordenadas de átomos de ligando (en esta variante, típicamente entre 8 y 16 posiciones atómicas) y predice los elementos correspondientes. Se trata de un modelo de difusión sobre coordenadas con arquitectura Pairformer y bloques denoising específicos, con 355,687 millones de parámetros en el modelo de generación de coordenadas.

Esta variante es relevante por tres motivos: es la única de las cinco publicadas que aborda ligandos, amplía el diseño más allá de proteínas, DNA y RNA, y lo hace con contexto rígido, lo que simplifica el cómputo al mantener fijas las coordenadas del receptor. No obstante, sus resultados son "provisionales": las coordenadas y elementos se predicen, pero los enlaces, cargas formales e identidades de componentes químicos quedan sin determinar, por lo que no sustituye a un pipeline completo de diseño de fármacos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión sobre coordenadas al-átomo con Pairformer y bloques denoising de tokens/átomos |
| Parametros totales | 355,687 millones (modelo de generación de coordenadas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

Parámetros arquitectónicos adicionales publicados en la model card: tamaño single 384, tamaño pair 128, 48 bloques Pairformer, 4 etapas MSA, 24 bloques token denoiser, 3 bloques atom encoder y 3 bloques atom decoder.

## Arquitectura y entrenamiento

ODesign emplea un modelo de difusión sobre coordenadas atómicas de tipo all-atom. La arquitectura combina un tronco Pairformer (48 bloques, dimensiones single 384 y pair 128) con etapas MSA (4), un denoiser de tokens (24 bloques) y codificador/decodificador de átomos (3 bloques cada uno). La generación se realiza en dos fases: primero se difunden coordenadas y después se asigna la identidad química (secuencia o elemento) mediante un módulo de inverse folding.

En esta variante de ligando, la asignación de elementos se efectúa con un OInvFold de ligando (descrito como "provisional"), mientras que las rutas de proteína usan ProteinMPNN (sin contexto de ligando) o LigandMPNN (con contexto), la ruta de DNA emplea OInvFold y la de RNA usa gRNAde. El contexto de receptor es rígido: las coordenadas del receptor se mantienen fijas, a diferencia de la variante `protein-flex`. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO; esos datos no están disponibles.

## Capacidades

- Generación de coordenadas atómicas de ligando en un bolsillo de unión observado, con slots de 8 a 16 átomos configurables.
- Predicción de elementos químicos por átomo junto con probabilidades por átomo.
- Predicción de logits de pares de enlace (bond logits) entre átomos generados.
- Diseño de proteínas, DNA y RNA en las variantes hermanas del mismo tronco arquitectónico.
- Inverse folding alternativo mediante `ODesignOInvFoldProteinPipeline` y `ODesignOInvFoldRnaPipeline`, ejecutables de forma independiente.
- Decodificación de backbone que devuelve objetos `ODesignBackboneSample` con estructura y linkers no unidos.
- Diseño de novo mediante `PolymerSequence` tipada con residuos desconocidos.
- No soporta tool calling, function calling, agentes ni capacidades multilingües: es un modelo biológico, no un LLM.

## Casos de uso

- Exploración de químicas en un bolsillo conocido: dado un complejo receptor en formato CIF, generar propuestas de coordenadas de ligando de 8 a 16 átomos para estudiar posibles modos de unión antes de un modelado químico completo.
- Generación de hipótesis para docking: usar las coordenadas provisionales como punto de partida de un pipeline de docking o dinámica molecular, aprovechando que el receptor rígido no introduce grados de libertad adicionales.
- Diseño de novo de fragmentos: suministrar una `PolymerSequence` tipada de residuos desconocidos o un bolsillo vacío para generar propuestas iniciales de fragmentos que luego se refinan con herramientas químicas.
- Integración en pipelines de descubrimiento in silico: la API `ofoldx.pipeline("design", model="oteam/odesign-ligand-rigid")` permite encadenar generación de coordenadas con etapas posteriores de filtrado y scoring.
- Estudio de flexibilidad del receptor: comparar esta variante rígida con `oteam/odesign-protein-flex` para evaluar el efecto de la rigidez en las propuestas generadas.
- Prototipado académico y benchmarking de métodos de difusión: al ser una implementación no oficial con pesos safetensors y licencia AGPL-3.0, es útil para reproducir y comparar resultados frente al repositorio oficial.
- Diseño combinado con las rutas DNA/RNA: usar el mismo tronco `ODesignModel` para generar ácidos nucleicos con contexto rígido en variantes hermanas y contrastar la calidad de las propuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio pesa 1,4 GB en formato safetensors; el tamaño en memoria durante la difusión con 48 bloques Pairformer y 355,687 millones de parámetros es considerable, pero no se especifica.
- GPU recomendadas: no disponible. Dado el tamaño del tronco Pairformer, se requiere GPU de datacenter (A100, H100) o equivalentes; no hay datos confirmados.
- Compatibilidad con GPU de consumo: no disponible. No se confirma que quepa en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: librería `ofoldx` (instalable con `pip install ofoldx`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/odesign-ligand-rigid | Difusión al-átomo, ligando, contexto rígido | 355,687 M (coordenadas) | No disponible | AGPL-3.0 | Hugging Face (implementación no oficial) |
| oteam/odesign-protein-rigid | Difusión al-átomo, proteína, contexto rígido | No disponible en esta ficha | No disponible | AGPL-3.0 | Hugging Face |
| oteam/odesign-protein-flex | Difusión al-átomo, proteína, contexto flexible | No disponible en esta ficha | No disponible | AGPL-3.0 | Hugging Face |
| oteam/odesign-dna-rigid | Difusión al-átomo, DNA, contexto rígido | No disponible en esta ficha | No disponible | AGPL-3.0 | Hugging Face |
| oteam/odesign-rna-rigid | Difusión al-átomo, RNA, contexto rígido | No disponible en esta ficha | No disponible | AGPL-3.0 | Hugging Face |

No se dispone de datos de benchmarks para establecer comparaciones cuantitativas con modelos de terceros de la misma categoría (difusión para diseño de ligandos).

## Limitaciones y advertencias

- Implementación no oficial: la model card ha sido escrita por el equipo OFoldX, no por los autores originales de ODesign; los resultados pueden diferir del repositorio oficial.
- Resultados provisionales: los ligandos generados no tienen enlaces, cargas formales ni identidades de componentes químicos determinados; no son moléculas químicamente completas.
- Contexto rígido: el receptor no se relaja, lo que puede sesgar las propuestas en bolsillos con flexibilidad significativa; para esos casos existe la variante `protein-flex`.
- Riesgo de propuestas no realistas: al ser un modelo de difusión sobre coordenadas sin validación química integrada, puede generar geometrías o elementos incompatibles con restricciones de validez molecular.
- Sesgos de datos: no se documenta la composición del dataset de entrenamiento, por lo que se desconoce la cobertura de tipos de bolsillo y químicas.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y sobre el uso en red; conviene revisar su compatibilidad con uso comercial propietario.
- Idiomas: no aplica; el modelo no procesa texto natural.
- Datos ausentes: no hay información sobre cuantización, latencia, throughput ni benchmarks, lo que dificulta planificar su uso en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/odesign-ligand-rigid
- Paper: https://arxiv.org/abs/2510.22304
- Repositorio oficial: https://github.com/The-Institute-for-AI-Molecular-Design/ODesign
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/odesign
- Librería ofoldx: https://ofoldx.valtech.ai/
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Guía de química: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/chemistry/README.md
- Variante protein-flex: https://huggingface.co/oteam/odesign-protein-flex
- Variante protein-rigid: https://huggingface.co/oteam/odesign-protein-rigid
- Variante dna-rigid: https://huggingface.co/oteam/odesign-dna-rigid
- Variante rna-rigid: https://huggingface.co/oteam/odesign-rna-rigid
