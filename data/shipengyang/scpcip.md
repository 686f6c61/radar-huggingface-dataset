# shipengyang/scPCIP

## Resumen

scPCIP no es un modelo de lenguaje ni una red neuronal en el sentido habitual, sino un repositorio de datos auxiliares para la herramienta scPCIP, un anotador de tipos celulares basado en programas génicos para datos de scRNA-seq de plantas. El repositorio, publicado por Shipeng Yang, contiene un mapa de genes a ortógrupos eggNOG (`gene_to_feature.tsv`) y cuatro diccionarios YAML con programas génicos ponderados por tipo celular para órganos de raíz, hoja, flor y semilla.

El propósito del paquete es permitir la anotación cruzada de tipos celulares entre especies vegetales: en lugar de depender de marcadores específicos de una especie, scPCIP utiliza programas génicos conservados aprendidos de múltiples atlas de células individuales de plantas, con estimaciones de fiabilidad obtenidas mediante validación leave-one-species-out. El mapa de genes cubre doce especies, entre ellas Arabidopsis thaliana, Oryza sativa, Zea mays, Triticum aestivum, Glycine max y Solanum lycopersicum.

Es relevante ahora porque la anotación de tipos celulares en scRNA-seq vegetal sigue siendo un cuello de botella por la escasez de marcadores validados fuera de las especies modelo. La licencia MIT y la disponibilidad de los diccionarios junto con el paquete `scpcip` facilitan su integración en flujos de análisis existentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de datos, no modelo neuronal) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | TSV (`gene_to_feature.tsv`) y YAML (`dictionaries/*.yaml`) |

## Arquitectura y entrenamiento

El repositorio no contiene pesos de un modelo entrenado, sino artefactos derivados de un proceso de aprendizaje de programas génicos. Los diccionarios (`root.yaml`, `leaf.yaml`, `flower.yaml`, `seed.yaml`) recogen, para cada tipo celular, ortógrupos positivos ponderados aprendidos a partir de numerosos atlas de scRNA-seq de plantas etiquetados. Cada entrada incluye además una estimación de fiabilidad calculada mediante validación leave-one-species-out, lo que permite ponderar la confianza de cada programa en especies no vistas durante el ajuste.

El mapa `gene_to_feature.tsv` relaciona identificadores de gen de la matriz de entrada con ortógrupos eggNOG canónicos, con columnas de especie, identificador de matriz, identificador canónico, identificador de característica, peso, confianza y fuente. El paquete `scpcip` descarga este mapa desde el repositorio en el primer uso; los diccionarios van incluidos en el propio paquete. Para especies no cubiertas, el flujo admite un mapa proporcionado por el usuario generado con eggNOG-mapper.

## Capacidades

- Anotación de tipos celulares en datos de scRNA-seq de plantas a partir de programas génicos conservados.
- Cobertura de tipos celulares de raíz: epidermis, córtex, endodermis, periciclo, floema, procambium, xilema, caliptra y estado de meristemo.
- Cobertura de hoja: epidermis, mesófilo y vasculatura (xilema secundario y floema).
- Cobertura de flor: polen, estambre, carpelo, perianto y categoría no floral.
- Cobertura de semilla: embrión, endospermo y cubierta seminal.
- Transferencia entre especies mediante mapeo a ortógrupos eggNOG.
- Soporte de especies adicionales mediante mapa de genes proporcionado por el usuario.
- Ponderación por fiabilidad de cada programa génico según validación leave-one-species-out.

## Casos de uso

- Anotación de atlas de raíz en especies no modelo: se aplica el diccionario `root.yaml` sobre la matriz de expresión mapeada a ortógrupos, obteniendo etiquetas para epidermis, córtex, endodermis y demás tipos sin necesidad de marcadores propios de la especie.
- Anotación de datos de hoja en cultivos: el diccionario `leaf.yaml` permite distinguir mesófilo, epidermis y vasculatura en especies como Glycine max o Solanum lycopersicum, cubiertas por el mapa de genes incluido.
- Caracterización de tejidos florales y reproductivos: `flower.yaml` facilita separar polen, estambre, carpelo y perianto en experimentos de desarrollo floral.
- Estudios de semilla y endospermo: `seed.yaml` permite etiquetar embrión, endospermo y cubierta seminal en atlas de semilla, un tejido con marcadores escasamente conservados.
- Integración en pipelines de análisis de scRNA-seq: el paquete `scpcip` descarga automáticamente el mapa de genes y carga los diccionarios, lo que simplifica su incorporación a flujos basados en Scanpy o Seurat tras la conversión de identificadores.
- Extensión a nuevas especies: para organismos fuera de las doce especies cubiertas, se genera un mapa con eggNOG-mapper y se reutilizan los diccionarios, aprovechando la naturaleza conservada de los programas.
- Validación cruzada de anotaciones manuales: las estimaciones de fiabilidad por programa permiten contrastar y priorizar etiquetas en revisiones de anotación existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica VRAM de GPU para un modelo neuronal: el repositorio contiene ficheros de texto (TSV y YAML) de tamaño reducido.
- El consumo de recursos depende del pipeline de scRNA-seq que use los diccionarios (normalización, mapeo de identificadores y puntuación de programas), no del repositorio en sí.
- Cabe en cualquier equipo convencional; no requiere GPU dedicada para la carga de los datos.
- Opciones de despliegue: paquete `scpcip` desde el repositorio GitHub del autor, con descarga automática del mapa de genes desde HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Enfoque | Cobertura de especies | Licencia | Disponibilidad |
|---|---|---|---|---|
| scPCIP | Programas génicos conservados vía ortógrupos eggNOG | 12 especies en el mapa incluido; ampliable con mapa propio | MIT | HuggingFace y GitHub |
| Anotadores basados en marcadores específicos de especie | Listas de genes marcadores por especie | Limitada a la especie para la que se definieron | Variable | Variable |
| Métodos de transferencia de etiquetas entre atlas | Modelos estadísticos o de machine learning sobre expresión | Depende del atlas de referencia | Variable | Variable |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene datos auxiliares, no un modelo entrenado; no debe interpretarse como un modelo generativo ni evaluarse con métricas de LLM.
- La cobertura de tipos celulares se limita a los programas incluidos en los cuatro diccionarios (raíz, hoja, flor y semilla); tejidos o estados no contemplados no se anotarán.
- Las doce especies del mapa de genes están fijadas; para otras es obligatorio generar un mapa con eggNOG-mapper, lo que introduce dependencia de la calidad de esa anotación.
- La fiabilidad de cada programa varía según la especie; las estimaciones leave-one-species-out deben consultarse antes de confiar en una etiqueta concreta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción comunitaria.
- No se documentan sesgos específicos ni tasas de error en la información disponible.
- La licencia MIT permite uso comercial y modificación, pero conviene citar el artículo de bioRxiv asociado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/shipengyang/scPCIP
- Repositorio GitHub del paquete: https://github.com/Shipeng-Yang/scPCIP
- Cita: Yang, S., Si, C., Wu, Y., Sun, Z., Yao, C., Sun, X., Wang, L., Li, W. & Zhong, Q. scPCIP: cross-species annotation of plant cell types with conserved gene programs. *bioRxiv* (2026).
