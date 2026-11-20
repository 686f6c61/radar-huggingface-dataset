# bviggiano/ESMFold2-Experimental-Fast-Cutoff2025

## Resumen

ESMFold2-Experimental-Fast-Cutoff2025 es un modelo de prediccion de estructura de proteinas desarrollado por Chan Zuckerberg Biohub, publicado como parte del ecosistema ESMFold2. El modelo predice estructuras tridimensionales de proteinas con resolucion atomica (all-atom) a partir de una secuencia de aminoacidos, pudiendo operar tanto en modo de secuencia unica como condicionado por alineamiento multiple de secuencias (MSA) para mejorar la precision en dianas dificiles. Esta variante concreta, etiquetada como "Experimental-Fast-Cutoff2025", forma parte de la release experimental destinada a reproducir los hallazgos del articulo "Language Modeling Materializes a World Model of Protein Biology".

El repositorio analizado es un espejo de procedencia (provenance mirror) creado por el usuario bviggiano a partir del modelo original `biohub/ESMFold2-Experimental-Fast-Cutoff2025`, con el unico proposito de preservar los pesos para trazabilidad experimental. Los ficheros `model.safetensors` y `config.json` son byte-identicos al commit original, segun los hashes SHA-256 documentados en la model card del espejo. El modelo cuenta con 179.303.900 parametros y un tamano de repositorio de 0,7 GB.

La relevancia de esta ficha radica en que documenta una pieza del stack ESMFold2, cuyo articulo asociado propone un marco de "world model" de biologia de proteinas derivado de modelado de lenguaje. Para investigadores que necesiten reproducir resultados o integrar prediccion estructural en pipelines de biologia computacional, este espejo ofrece una copia verificable del modelo original bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESMFold2 (modelo de prediccion de estructura proteica basado en ESM; detalles internos no disponibles) |
| Parametros totales | 179.303.900 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos; el modelo opera sobre secuencias de proteinas, no texto natural) |
| Licencia | MIT (Copyright 2026 Chan Zuckerberg Biohub, Inc.) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de ESMFold2-Experimental-Fast-Cutoff2025. Por el nombre y el ecosistema al que pertenece (ESM, ESMFold2), se trata de un modelo de prediccion de estructura proteica derivado de la linea ESM, que combina representaciones de lenguaje de proteinas con un modulo de plegamiento estructural. El articulo asociado, "Language Modeling Materializes a World Model of Protein Biology", sugiere que el entrenamiento se apoya en objetivos de modelado de lenguaje sobre secuencias de proteinas que inducen un modelo del mundo biologico utilizable para tareas estructurales. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO.

La variante "Fast-Cutoff2025" indica una configuracion experimental concreta dentro de la familia ESMFold2, presumiblemente orientada a un regimen de inferencia mas rapido o a un recorte temporal de datos de entrenamiento (cutoff) de 2025. No se han publicado en la informacion proporcionada detalles tecnicos adicionales sobre innovaciones como decodificacion especulativa, atencion lineal u otras optimizaciones. El modelo original esta pensado para uso en investigacion; el autor recomienda emplear `biohub/ESMFold2` para trabajo de investigacion general y reservar esta variante experimental para reproducibilidad.

## Capacidades

- Prediccion de estructura tridimensional de proteinas con resolucion atomica (all-atom) a partir de secuencia de aminoacidos.
- Prediccion condicionada por secuencia unica (single-sequence).
- Prediccion condicionada por alineamiento multiple de secuencias (MSA) para mejorar la precision en dianas dificiles.
- Modelado de lenguaje de proteinas subyacente, segun el marco del articulo asociado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues de texto natural: no aplica; el dominio es secuencias de proteinas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prediccion estructural de proteinas noveles: dado un fasta con una secuencia sin estructura resuelta, el modelo genera coordenadas atomicas 3D que pueden usarse como hipotesis para diseno experimental posterior (cristalografia, crio-EM).
- Anotacion funcional asistida por estructura: al disponer de la estructura predicha, se pueden inferir dominios, sitios activos y posibles funciones mediante comparacion con estructuras conocidas.
- Cribado computacional de variantes: para mutaciones de interes, predecir la estructura de la variante y comparar con la nativa para priorizar experimentos de estabilidad o funcion.
- Prediccion en dianas dificiles con MSA: en proteinas con pocos homologos, el modo condicionado por MSA permite mejorar la precision respecto al modo de secuencia unica.
- Reproducibilidad de investigacion: al ser un espejo byte-identico del modelo original, permite reproducir exactamente los resultados del articulo asociado en entornos donde el repo original no este disponible.
- Integracion en pipelines de biologia estructural: el modelo puede envolverse en flujos automatizados que reciban secuencias de un repositorio (p. ej. UniProt) y devuelvan estructuras en formato PDB/mmCIF para su analisis posterior.
- Docencia y prototipado: por su tamano moderado (179 M parametros, 0,7 GB), es viable ejecutarlo en entornos de laboratorio para experimentos docentes de plegamiento proteico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 179,3 M parametros en fp32 los pesos ocupan aproximadamente 0,72 GB, por lo que la VRAM necesaria sera moderada y dependera del modo (secuencia unica vs MSA) y de la longitud de la proteina.
- GPU recomendadas: no disponible; por tamano, cualquier GPU con al menos unos pocos GB de VRAM libre deberia poder alojar los pesos.
- ¿Cabe en consumer GPU?: por el tamano de parametros, es plausible en GPUs consumer recientes (p. ej. RTX 3060 en adelante), aunque no se confirma en la informacion proporcionada.
- Opciones de despliegue: no disponible; el codigo de referencia esta en `github.com/Biohub/esm`, que es el punto de entrada documentado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESMFold2-Experimental-Fast-Cutoff2025 (este) | 179.303.900 | no disponible | Prediccion estructural all-atom condicionada por secuencia o MSA | MIT | Espejo en HF; original en biohub/ESMFold2-Experimental-Fast-Cutoff2025 |
| ESMFold2 (biohub/ESMFold2) | no disponible | no disponible | Prediccion estructural all-atom (modelo recomendado para investigacion) | no disponible en esta ficha | Hugging Face |
| Otros predictores estructurales (p. ej. AlphaFold2, ESMFold v1) | no disponible en esta ficha | no disponible | Prediccion estructural | no disponible en esta ficha | no disponible en esta ficha |

La comparativa con alternativas concretas no puede completarse con los datos proporcionados; se indica "no disponible" para los campos no documentados.

## Limitaciones y advertencias

- Modelo experimental: el propio autor indica que estas variantes se publican para reproducibilidad y recomienda usar `biohub/ESMFold2` para trabajo de investigacion general.
- Es un espejo no oficial: la cuenta `bviggiano` no es el autor original; para citas y atribucion debe referenciarse a Chan Zuckerberg Biohub y al articulo asociado.
- Dominio restringido: el modelo opera sobre secuencias de proteinas; no es un modelo de texto natural pese a la etiqueta de idioma "en".
- Riesgo de alucinacion estructural: como todo predictor, puede generar estructuras plausibles pero incorrectas en regiones desordenadas o sin homologos; requiere validacion experimental.
- Sin datos publicos de benchmarks en esta ficha: no es posible afirmar su rendimiento relativo frente a alternativas sin consultar el articulo original.
- Licencia MIT: permite uso comercial segun los terminos, pero debe verificarse el texto completo en `LICENSE.md` y respetarse la atribucion a Chan Zuckerberg Biohub.
- Caveat de produccion: al ser un modelo experimental y un espejo, no se garantiza mantenimiento, actualizaciones ni soporte; para produccion conviene partir del repositorio original.

## Enlaces

- Espejo en Hugging Face: https://huggingface.co/bviggiano/ESMFold2-Experimental-Fast-Cutoff2025
- Modelo original: https://huggingface.co/biohub/ESMFold2-Experimental-Fast-Cutoff2025
- Commit original espejado: https://huggingface.co/biohub/ESMFold2-Experimental-Fast-Cutoff2025/tree/13f892d3bc9de27aa475e8a12ec76dba4054f4a2
- Modelo recomendado para investigacion: https://huggingface.co/biohub/ESMFold2
- Codigo: https://github.com/Biohub/esm
- Licencia: https://github.com/Biohub/esm/blob/main/LICENSE.md
- Paper (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.06.03.729735
- PDF del paper: https://biohub.ai/papers/esm_protein.pdf
