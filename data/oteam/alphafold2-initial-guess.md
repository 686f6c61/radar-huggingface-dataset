# oteam/alphafold2-initial-guess

## Resumen

`oteam/alphafold2-initial-guess` es una implementación no oficial de AlphaFold 2 publicada por el equipo OFoldX (OTeam-AI4S), correspondiente al checkpoint `model_1_ptm` configurado como evaluador de "initial guess" para la herramienta PXDesign. El modelo predice la estructura tridimensional de proteínas a partir de secuencias de aminoácidos, alineamientos múltiples de secuencias (MSA) y plantillas estructurales opcionales, devolviendo coordenadas atómicas y valores de confianza (pLDDT, PAE y pTM).

Se trata de una arquitectura específica para biología estructural: un tronco Evoformer de 48 bloques más 4 bloques extra-MSA y un módulo estructural de 8 bloques con invariant point attention, sumando 93.291.674 parámetros en formato safetensors. No es un modelo de lenguaje: no genera texto ni código, sino que produce estructuras proteicas y métricas de confianza.

Su relevancia actual radica en que permite reproducir el protocolo de evaluación de AlphaFold 2 dentro del ecosistema `ofoldx`, con un pipeline sencillo vía `pip install ofoldx`. La variante "initial guess" está pensada para refinar o evaluar complejos target-binder ya asignados a secuencia partiendo de sus coordenadas existentes, lo que la hace útil en flujos de diseño de proteínas y validación de predicciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Evoformer (48 bloques) + 4 bloques extra-MSA + estructura con invariant point attention (8 bloques); predictor de estructura proteica condicionado por MSA y plantillas |
| Parametros totales | 93.291.674 (93,292 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (MSA de 256, representación de pares de 128 y representación single de 384; 4 pasos de reciclaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura descrita en el artículo original de AlphaFold 2 (Jumper et al., *Nature*, 2021): un tronco Evoformer que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un módulo estructural con invariant point attention que predice marcos de cadena principal, ángulos de cadena lateral, coordenadas atómicas y confianza. La variante incluye la cabeza pTM y PAE, por lo que reporta pLDDT, PAE y pTM. La configuración concreta corresponde a 48 bloques Evoformer, 4 bloques extra-MSA, 8 bloques estructurales, MSA de tamaño 256, pares de 128, single de 384 y 4 pasos de reciclaje.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset (PDB, Uniclust, etc.), ni si hubo etapas de refinamiento tipo RLHF (no aplicable en este dominio). El checkpoint se presenta como una implementación no oficial desarrollada por OFoldX a partir del repositorio oficial `google-deepmind/alphafold`; el equipo original de DeepMind no escribió esta model card. La innovación técnica destacable es el uso del modelo como evaluador de "initial guess" en PXDesign, empleando coordenadas existentes de un complejo target-binder como punto de partida.

## Capacidades

- Predicción de estructura proteica de monómeros a partir de secuencia, MSA y plantillas opcionales.
- Estimación de confianza por residuo (pLDDT) y, en esta variante, métricas PAE y pTM.
- Evaluación de complejos target-binder con coordenadas existentes como initial guess (uso previsto por PXDesign).
- Generación de coordenadas atómicas de cadena principal y cadenas laterales; los átomos no predichos (ligandos, hidrógenos, OXT terminal) quedan sin coordenadas.
- Integración con el pipeline `ofoldx.pipeline("fold", model=...)`, con soporte de semilla para reproducibilidad.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-step lingüístico ni capacidades multimodales de visión o audio.
- No dispone de capacidades multilingües en el sentido de procesamiento de lenguaje natural.

## Casos de uso

- Validación de diseños de proteínas: usar el checkpoint como evaluador de initial guess para complejos target-binder ya asignados a secuencia, comparando la estructura predicha con las coordenadas de partida y midiendo pLDDT, PAE y pTM para decidir si un diseño merece validación experimental.
- Refinamiento de modelos estructurales existentes: partir de coordenadas cristalográficas o de un modelo previo y dejar que el pipeline recalcule marcos y confianza, útil en pipelines de biología estructural computacional.
- Predicción de monómeros con confianza calibrada: emplear la cabeza pTM para filtrar predicciones de baja calidad antes de enviarlas a docking o a simulación de dinámica molecular.
- Integración en flujos de diseño de binders: encadenar la generación de secuencias candidatas con este evaluador para puntuar la plausibilidad estructural del complejo antes de pasar a síntesis.
- Reproducibilidad de experimentos académicos: al estar empaquetado en `ofoldx` con semilla configurable, permite repetir evaluaciones de forma determinista en estudios comparativos.
- Prototipado rápido en CPU: el pipeline admite `platform="CPU"` en la evaluación de ensembles, lo que facilita pruebas sin GPU dedicada en etapas tempranas de un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo pesa 0,4 GB en safetensors, pero el consumo en ejecución depende de la longitud de la secuencia, el tamaño del MSA y el número de reciclajes.
- GPU recomendadas: no disponible. El modelo original de AlphaFold 2 se ha ejecutado históricamente en GPUs de datacenter (A100, V100), pero no se confirma en esta ficha.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: exclusivamente mediante la librería `ofoldx` (`pip install ofoldx`), con pipeline `ofoldx.pipeline("fold", model="oteam/alphafold2-initial-guess")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros (M) | Contexto / MSA | Confianza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/alphafold2-initial-guess | 93,292 | MSA 256, pares 128, single 384, 4 reciclajes | pLDDT, PAE, pTM | AGPL-3.0 | HuggingFace (ofoldx) |
| oteam/alphafold2 | 93,283 | MSA 256, pares 128, single 384, 4 reciclajes | pLDDT | AGPL-3.0 | HuggingFace (ofoldx) |
| oteam/alphafold2-ptm | 93,292 | MSA 256, pares 128, single 384, 4 reciclajes | pLDDT, PAE, pTM | AGPL-3.0 | HuggingFace (ofoldx) |
| oteam/alphafold2-multimer | 93,278 | MSA 256, pares 128, single 384, 21 reciclajes | no especificado en la información | AGPL-3.0 | HuggingFace (ofoldx) |

Las alternativas externas al ecosistema OFoldX (por ejemplo, ESMFold o RoseTTAFold) no se detallan en la información proporcionada; sus datos comparativos figuran como no disponibles.

## Limitaciones y advertencias

- Implementación no oficial: el equipo de DeepMind no ha validado ni escrito esta model card; la fidelidad respecto al repositorio original debe contrastarse.
- Licencia AGPL-3.0: implica obligaciones de copyleft fuerte para uso en red y distribución; conviene revisar su compatibilidad con productos comerciales cerrados antes de desplegarlo.
- Los átomos no predichos (ligandos, hidrógenos, OXT terminal) no tienen coordenadas disponibles, lo que limita su uso en complejos con ligandos o modificaciones.
- Cada predicción se genera en un nuevo marco de coordenadas, por lo que no es directamente comparable con estructuras experimentales sin alineamiento previo.
- La relajación con Amber requiere OpenMM y PDBFixer instalados en el mismo entorno, y solo funciona con grafos proteicos lineales estándar cerrados.
- Riesgo de alucinación estructural: en regiones de baja cobertura MSA o sin homólogos, las predicciones pueden ser poco fiables; debe filtrarse por pLDDT y PAE.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento textual.
- No se dispone de información sobre sesgos, idiomas ni cuantizaciones; no se debe asumir compatibilidad con formatos GGUF u otros fuera de safetensors.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/alphafold2-initial-guess
- Variante monómero: https://huggingface.co/oteam/alphafold2
- Variante pTM: https://huggingface.co/oteam/alphafold2-ptm
- Variante multimer: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Código OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Librería ofoldx: https://ofoldx.valtech.ai/
- Paper AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial DeepMind: https://github.com/google-deepmind/alphafold
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
