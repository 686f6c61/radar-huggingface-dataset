# oteam/membranempnn-per-residue

## Resumen

MembraneMPNN per-residue es una implementación no oficial, distribuida por el equipo OFoldX, de los modelos ProteinMPNN condicionados por membrana publicados junto a LigandMPNN. El modelo resuelve el problema del diseño inverso de secuencias de proteínas (inverse folding) sobre esqueletos fijos, incorporando etiquetas de entorno de membrana a nivel de residuo para distinguir residuos expuestos, de interfaz de membrana y enterrados en la bicapa lipídica. Es relevante porque los modelos generalistas de diseño de secuencias no modelan de forma explícita el contexto de membrana, lo que degrada la calidad de las secuencias generadas para proteínas transmembrana.

Arquitectura de message passing sobre grafo espacial de residuos, con codificación de los átomos de esqueleto N, CA, C y O, tamaño oculto de 128, 3 bloques de encoder y 3 de decoder, y 48 vecinos por nodo. El modelo tiene 1.690.744 parámetros (1,691 M), lo que lo sitúa en la categoría de modelos ligeros de diseño de proteínas. La variante aquí descrita acepta etiquetas por residuo (0 = expuesto/otro, 1 = interfaz de membrana, 2 = enterrado en membrana); existe una variante hermana, `oteam/membranempnn-global`, con etiqueta binaria soluble/transmembrana.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio de HuggingFace, ya que no se han publicado resultados de benchmarks ni detalles completos de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Graph neural network de message passing (encoder-decoder) sobre grafo espacial de residuos, estilo ProteinMPNN |
| Parámetros totales | 1.690.744 (1,691 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del número de residuos del esqueleto de entrada y del vecindario k-NN de 48) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Átomos de esqueleto de entrada | N, CA, C, O |
| Tamaño oculto | 128 |
| Bloques de encoder / decoder | 3 / 3 |
| Vecinos por nodo | 48 |
| Librería | ofoldx |
| Pipeline | other (diseño de secuencias) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ProteinMPNN: un encoder de message passing que construye representaciones de cada residuo a partir de la geometría del esqueleto (N, CA, C, O) y de un grafo de 48 vecinos espaciales, seguido de un decoder autorregresivo que predice la identidad aminoacídica residuo a residuo. La innovación respecto al ProteinMPNN original es la incorporación de etiquetas de membrana como condicionamiento adicional: en esta variante, cada residuo recibe una etiqueta de entorno (0 = expuesto/otro, 1 = interfaz de membrana, 2 = enterrado en membrana), que se inyecta en el modelo para sesgar el diseño hacia entornos compatibles con la bicapa.

El entrenamiento se realiza para recuperar secuencias proteicas a partir de la geometría del esqueleto y las etiquetas de membrana. La model card remite a la documentación upstream de LigandMPNN para los datos de entrenamiento y la construcción de etiquetas, y no detalla el número de tokens, la composición del dataset ni si se aplicaron RLHF/DPO (no aplicable en este dominio). OFoldX expone operaciones diferenciables `encode` y `forward` para fine-tuning con etiquetas de membrana, pero la orquestación completa del entrenamiento queda a cargo de la aplicación del usuario.

## Capacidades

- Diseño inverso de secuencias proteicas sobre esqueletos fijos, con condicionamiento por etiquetas de membrana a nivel de residuo.
- Puntuación (scoring) de secuencias: devuelve NLL global y por residuo en nats por residuo, con múltiples órdenes de decodificación (`num_decoding_orders`) y semilla configurable.
- Soporte de posiciones fijas, identidades ligadas, restricciones de aminoácidos específicas por posición y sesgos de logits durante la generación.
- Condicionamiento por etiqueta global (variante hermana) o por residuo (esta variante).
- Integración con un pipeline de diseño y empaquetado (`MembraneMpnnDesignAndPackPipeline`) que genera coordenadas de cadenas laterales tras el diseño de secuencia, combinando con un MPNN Packer independiente.
- Ejecución por etapas (`prepare`, `forward`, `postprocess`) para pipelines de diseño.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo especializado en biología estructural computacional.

## Casos de uso

- Diseño de secuencias para proteínas transmembrana: dado un esqueleto de proteína de membrana, el modelo genera secuencias compatibles con entornos enterrados e interfaz, usando las etiquetas por residuo para sesgar la composición aminoacídica hacia residuos hidrófobos en la región de bicapa.
- Rediseño de regiones de interfaz de membrana: permite etiquetar selectivamente residuos de interfaz (label 1) para optimizar el plegamiento o la inserción en membrana sin alterar el resto de la secuencia.
- Puntuación de variantes de secuencia: el pipeline `score` calcula la NLL por residuo, útil para rankear candidatos generados por otros métodos o para filtrar diseños experimentales antes de su síntesis.
- Diseño y empaquetado de cadenas laterales: combinando el diseñador con el MPNN Packer se obtienen coordenadas completas (esqueleto más cadenas laterales), lo que facilita la inspección estructural y el análisis de contactos.
- Filtrado en pipelines de protein design: el modelo puede integrarse como etapa de scoring en flujos que generan muchos candidatos y necesitan una métrica de verosimilitud condicionada por membrana.
- Fine-tuning para familias específicas: al exponer operaciones diferenciables `encode` y `forward`, el modelo puede ajustarse con datos propios de una familia de proteínas de membrana para mejorar la recuperación de secuencias.
- Investigación en plegamiento de proteínas de membrana: el condicionamiento por residuo permite estudiar cómo la geometría del esqueleto y el entorno de membrana determinan la identidad aminoacídica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 1,691 M de parámetros, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer, aunque el consumo real depende del tamaño del esqueleto de entrada y del grafo de 48 vecinos.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con suficiente memoria para el grafo de residuos (RTX 3060 o superior) debería ser suficiente.
- Cabe en GPU consumer: sí, previsiblemente, dado el reducido número de parámetros.
- Opciones de despliegue: la model card solo documenta el uso mediante la librería `ofoldx` (`pip install ofoldx`) y sus pipelines `design` y `score`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MembraneMPNN per-residue (este) | 1,691 M | No disponible | Etiquetas de membrana por residuo (0/1/2) | AGPL-3.0 | HuggingFace (oteam) |
| MembraneMPNN global | No disponible | No disponible | Etiqueta binaria soluble/transmembrana | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN (original) | No disponible | No disponible | Sin condicionamiento de membrana | No disponible en la información | Repositorio upstream |
| LigandMPNN (upstream) | No disponible | No disponible | Membrana (global o por residuo) y ligandos | No disponible en la información | GitHub dauparas/LigandMPNN |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que se trata de una implementación no oficial de los modelos MembraneMPNN de LigandMPNN, escrita por el equipo OFoldX y no por los autores originales.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere liberar el código derivado, lo que puede ser restrictivo para producción.
- Dependencia de la librería `ofoldx`: el modelo no es utilizable con frameworks estándar de HuggingFace Transformers; requiere instalar `ofoldx` y adaptarse a su API de pipelines.
- Sin datos de benchmarks: no hay métricas publicadas de recuperación de secuencia, perplexity ni comparación con el modelo upstream, lo que impide evaluar su calidad objetiva.
- Datos de entrenamiento no detallados: la model card remite a la documentación upstream y no especifica el dataset, el número de estructuras ni la composición, lo que limita la reproducibilidad.
- Riesgo de sesgo en la composición aminoacídica: al condicionar por etiquetas de membrana, el modelo puede favorecer residuos hidrófobos en regiones etiquetadas como enterradas, con posible pérdida de diversidad en el diseño.
- Dependencia de la calidad del esqueleto de entrada: el diseño inverso solo es tan bueno como la estructura de backbone proporcionada; esqueletos mal predichos o de baja resolución degradan la salida.
- Sin soporte de contexto lingüístico ni multilingüe: no aplica a tareas de texto; su uso está acotado al dominio de biología estructural.
- Etiquetas no especificadas: los residuos sin etiqueta reciben el valor 0 por defecto, lo que puede introducir sesgos si no se asignan correctamente las regiones de membrana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/membranempnn-per-residue
- Variante global: https://huggingface.co/oteam/membranempnn-global
- Código del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/membranempnn
- Guía de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer en OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Repositorio original LigandMPNN: https://github.com/dauparas/LigandMPNN
- Documentación upstream de modelos de membrana: https://github.com/dauparas/LigandMPNN#24---model_type-global_label_membrane_mpnn
- Paper ProteinMPNN: https://doi.org/10.1126/science.add2187
- Sitio de OFoldX: https://ofoldx.valtech.ai/
