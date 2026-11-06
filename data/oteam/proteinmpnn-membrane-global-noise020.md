# oteam/proteinmpnn-membrane-global-noise020

## Resumen

MembraneMPNN es una implementación no oficial de los modelos ProteinMPNN condicionados por membrana publicados junto a LigandMPNN, distribuida por el equipo de OFoldX bajo el identificador `oteam/proteinmpnn-membrane-global-noise020`. El modelo resuelve el problema del diseño inverso de secuencias proteicas (*inverse folding*): dado un esqueleto proteico fijo (átomos N, CA, C y O), predice la identidad de los aminoácidos que lo estabilizan. Su particularidad es que incorpora etiquetas de entorno de membrana como condicionamiento adicional, de modo que distingue entre proteínas solubles y transmembrana durante la generación.

Arquitectura de message passing sobre un grafo espacial de residuos, con un encoder de 3 bloques y un decoder autorregresivo de 3 bloques, tamaño oculto de 128 y 48 vecinos por nodo. El modelo es deliberadamente compacto: 1.690.744 parámetros totales (1,691 M), lo que lo sitúa en la categoría de modelos ligeros que pueden ejecutarse en CPU o en GPUs de consumo sin dificultad.

Es relevante ahora porque el diseño computacional de proteínas de membrana —fármacos, receptores, canales iónicos y transportadores— sigue siendo un cuello de botella frente al diseño de proteínas solubles, y disponer de un checkpoint abierto con condicionamiento de membrana, licencia AGPL-3.0 y pipeline reproducible en una librería Python facilita la experimentación y la integración en flujos de diseño y *scoring*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ProteinMPNN (message passing sobre grafo espacial de residuos) con encoder y decoder autorregresivo; 3 bloques de encoder, 3 de decoder, hidden size 128, 48 vecinos |
| Parametros totales | 1.690.744 (1,691 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; el modelo opera sobre el grafo de residuos del esqueleto de entrada (átomos N, CA, C, O), sin ventana de contexto textual |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ProteinMPNN: un encoder que procesa el grafo espacial de residuos construido a partir de las coordenadas de los átomos de esqueleto N, CA, C y O, y un decoder autorregresivo que genera la secuencia aminoacídica residuo a residuo en un orden de decodificación aleatorio. La variante aquí publicada añade condicionamiento por etiqueta de membrana global: la etiqueta `0` indica proteína soluble y la etiqueta `1` indica proteína transmembrana, aplicada a todos los residuos retenidos. Existe una variante hermana, `oteam/membranempnn-per-residue`, con etiquetas por residuo (`0` expuesto/otro, `1` interfaz de membrana, `2` enterrado en membrana).

El entrenamiento consiste en recuperar la secuencia proteica a partir de la geometría del esqueleto y las etiquetas de entorno de membrana. La model card remite a las descripciones upstream de LigandMPNN para los datos de entrenamiento y la construcción de etiquetas, y no detalla el número de tokens, la composición del dataset ni si hubo RLHF/DPO (no aplicable en este dominio). OFoldX expone operaciones diferenciables `encode` y `forward` para entrenamiento y *fine-tuning* con etiquetas de membrana, pero la construcción del dataset y la orquestación completa del entrenamiento quedan a cargo de la aplicación de entrenamiento. La generación soporta posiciones fijas, identidades ligadas, restricciones de aminoácidos específicas por posición y sesgos sobre logits.

## Capacidades

- Diseño inverso de secuencias proteicas (*inverse folding*) a partir de un esqueleto fijo en formato CIF/PDB.
- Condicionamiento por etiqueta de membrana global (soluble vs. transmembrana) para sesgar el diseño hacia entornos adecuados.
- *Scoring* de secuencias: devuelve NLL global y por residuo en nats por residuo, con múltiples órdenes de decodificación (`num_decoding_orders`) y semilla configurable.
- Generación con restricciones: posiciones fijas, identidades ligadas, restricciones de aminoácidos por posición y sesgos de logits.
- Integración con un *packer* MPNN independiente (`MembraneMpnnDesignAndPackPipeline`) para generar coordenadas de cadenas laterales tras el diseño de secuencia.
- Ejecución por etapas (`prepare`, `forward`, `postprocess`) mediante la librería `ofoldx`.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo especializado en biología estructural.

## Casos de uso

- **Diseño de proteínas de membrana de novo**: dado un esqueleto transmembrana generado por un modelo de *folding* o de difusión, MembraneMPNN propone secuencias compatibles con el entorno lipídico usando `membrane_labels=1`, lo que reduce el sesgo hacia secuencias solubles inadecuadas para la membrana.
- **Rediseño de receptores acoplados a proteína G (GPCR)**: partiendo de una estructura cristalográfica o predicha, el modelo genera variantes de secuencia que preservan el plegamiento transmembrana, útil para estudios de estabilidad y expresión heteróloga.
- **Filtrado y priorización de candidatos**: el modo `score` calcula la NLL por residuo de secuencias candidatas sobre un esqueleto dado, permitiendo rankear diseños generados por otros métodos antes de su síntesis.
- **Diseño de canales iónicos y transportadores**: la etiqueta de membrana permite generar secuencias con patrones de hidrofobicidad compatibles con hélices transmembrana, un caso donde los modelos genéricos de *inverse folding* rinden peor.
- **Ingeniería de estabilidad de proteínas de membrana**: fijando posiciones funcionales críticas (sitio activo, motivos de unión) y dejando libres el resto, el modelo propone sustituciones que mantienen el entorno de membrana.
- **Pipelines de diseño y *packing* completos**: combinando el diseñador con el MPNN Packer se obtienen coordenadas de cadena lateral, lo que permite pasar de esqueleto a estructura completa con secuencia diseñada en un flujo reproducible.
- **Investigación en métodos de condicionamiento**: al ser una implementación abierta con operaciones diferenciables, sirve como base para experimentar con nuevas etiquetas de entorno o estrategias de *fine-tuning*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos en precisión completa (1,691 M de parámetros, ~7 MB en fp32), más el grafo de residuos y los tensores intermedios, que dominan el consumo y dependen del tamaño de la proteína (48 vecinos por residuo).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090, RTX 2080 Ti o superiores no suponen ninguna restricción.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (incluso GTX 1650 o inferiores con memoria suficiente para proteínas grandes); también es viable en CPU para proteínas de tamaño moderado.
- Opciones de despliegue: la librería `ofoldx` (`pip install ofoldx`) es la vía oficial; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del número de residuos, del número de órdenes de decodificación y del *batch size*.

## Comparativa con modelos similares

| Modelo | Parametros | Condicionamiento de membrana | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/proteinmpnn-membrane-global-noise020 | 1,691 M | Global (soluble/transmembrana) | Esqueleto N, CA, C, O | AGPL-3.0 | Hugging Face (OFoldX) |
| oteam/membranempnn-per-residue | No disponible | Por residuo (expuesto/interfaz/enterrado) | Esqueleto N, CA, C, O | AGPL-3.0 | Hugging Face (OFoldX) |
| ProteinMPNN original (dauparas) | ~1,7 M (variantes estándar) | No | Esqueleto N, CA, C, O | MIT (repositorio original) | GitHub dauparas/ProteinMPNN |
| LigandMPNN (dauparas) | No disponible | Membrana y ligando (checkpoints oficiales) | Esqueleto + ligandos/etiquetas | MIT (repositorio original) | GitHub dauparas/LigandMPNN |

## Limitaciones y advertencias

- Implementación no oficial: el equipo que publicó MembraneMPNN no escribió esta model card; los artefactos pertenecen al proyecto OFoldX y pueden divergir de los checkpoints originales de LigandMPNN.
- Licencia AGPL-3.0: el uso comercial exige cumplir las obligaciones de copyleft del software; conviene revisar con asesoría legal antes de integrarlo en productos propietarios.
- Dependencia de la librería `ofoldx`: el modelo no es utilizable con frameworks estándar de Hugging Face `transformers`; requiere el ecosistema OFoldX.
- El modelo solo acepta esqueletos con átomos N, CA, C y O; esqueletos incompletos o con geometrías aberrantes degradan la calidad del diseño.
- La etiqueta de membrana global es binaria y no captura la posición exacta de la membrana; para eso existe la variante por residuo, que no es este checkpoint.
- Riesgo de secuencias no plegables o agregantes: como todo modelo de *inverse folding*, las secuencias generadas requieren validación estructural (p. ej., con AlphaFold u otro predictor) antes de su síntesis.
- No se documentan sesgos del dataset de entrenamiento ni métricas de rendimiento en esta model card; la evaluación queda enteramente del lado del usuario.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, sin historial de validación comunitaria.
- Fecha de creación indicada como 2026-11-01, posterior a la fecha habitual de publicación; conviene verificar la integridad y procedencia de los artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/proteinmpnn-membrane-global-noise020
- Variante global: https://huggingface.co/oteam/membranempnn-global
- Variante por residuo: https://huggingface.co/oteam/membranempnn-per-residue
- Código del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/membranempnn
- Guía de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer en OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Repositorio oficial LigandMPNN: https://github.com/dauparas/LigandMPNN
- Sección de modelos de membrana en LigandMPNN: https://github.com/dauparas/LigandMPNN#24---model_type-global_label_membrane_mpnn
- Paper ProteinMPNN (Science, 2022): https://doi.org/10.1126/science.add2187
- Sitio de OFoldX: https://ofoldx.valtech.ai/
