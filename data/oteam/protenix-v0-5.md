# oteam/protenix-v0.5

## Resumen

Protenix-v0.5 es un modelo de prediccion de estructura biomolecular a nivel de atomo completo (all-atom), capaz de predecir la estructura tridimensional de proteinas, acidos nucleicos (ADN y ARN), ligandos de bajo peso molecular y sus complejos. Se trata de una reproduccion no oficial del modelo AlphaFold3, desarrollada originalmente por el equipo de ByteDance (autores Xinshi Chen, Yuxuan Zhang y colaboradores) y publicada como preprint en bioRxiv en enero de 2025. La version aqui descrita (v0.5 base) es la variante fundamental del conjunto de checkpoints, empaquetada por el equipo OFoldX para su libreria `ofoldx`.

Arquitectonicamente combina embeddings de atomos y tokens con un tronco Pairformer condicionado por MSA (alineamiento multiple de secuencias), un modulo de difusion de coordenadas EDM y cabezas de distograma y confianza. La version base emplea 48 bloques Pairformer, 4 etapas de MSA, dimensiones de representacion single de 384 y pair de 128, con 10 pasos de reciclado, totalizando 368,123 millones de parametros.

Su relevancia radica en que reproduce el enfoque de AlphaFold3 (prediccion conjunta de proteinas y acidos nucleicos con atomos completos) bajo licencia AGPL-3.0, con disponibilidad de pesos en formato safetensors y una familia de variantes (mini, tiny, constraint, template, v2) que cubren distintos compromisos entre coste computacional y precision. No obstante, es un modelo de investigacion biologica, no un modelo de lenguaje, por lo que su evaluacion debe hacerse en terminos de precision estructural (RMSD, lDDT) y no de benchmarks de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pairformer con tronco condicionado por MSA, difusion de coordenadas EDM y cabezas de distograma/confianza |
| Parametros totales | 368.123 millones (368.123.313) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; limitado por longitud de secuencia/MSA de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Libreria | ofoldx |
| Tamano del repo | 1.5 GB |
| Pipeline | other (structure prediction) |
| Bloques Pairformer | 48 |
| Etapas MSA | 4 |
| Dimension single | 384 |
| Dimension pair | 128 |
| Pasos de reciclado | 10 |

## Arquitectura y entrenamiento

Protenix sigue el diseno de AlphaFold3: un tronco Pairformer que procesa representaciones de pares de residuos condicionadas por el alineamiento multiple de secuencias (MSA), combinado con embeddings de atomos y tokens. Sobre el tronco se situa un modulo de difusion de coordenadas de tipo EDM (Elucidating the Design space of diffusion models) que genera las coordenadas atomicas tridimensionales, junto con cabezas auxiliares de distograma y de confianza que estiman la calidad de la prediccion. La version base v0.5 usa 48 bloques Pairformer, 4 etapas de MSA, dimensiones single=384 y pair=128, con 10 pasos de reciclado.

El modelo esta entrenado para predecir estructuras de proteinas, ADN, ARN, ligandos pequenos y complejos mixtos. La model card menciona variantes con condicionamiento adicional: template (plantillas estructurales), structure-conditioned (condicionamiento por estructura ruidosa), constraint (restricciones de contactos atomo-atomo, token-token, bolsillos y subestructuras) y variantes mini/tiny con menor profundidad. No se detalla en la informacion proporcionada el volumen exacto de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF/DPO (no aplicable a este tipo de modelo). Las variantes Mini ESM e ISM incorporan un codificador ESM2 congelado (los recuentos de parametros de ~2967 M incluyen ese encoder).

## Capacidades

- Prediccion de estructura 3D all-atom de proteinas monomericas y multimericas.
- Prediccion de estructura de acido ribonucleico (ARN) y acido desoxirribonucleico (ADN).
- Prediccion de estructura de ligandos de bajo peso molecular (small molecules).
- Prediccion de complejos mixtos proteina-ligando, proteina-ARN, proteina-ADN y combinaciones.
- Estimacion de confianza por residuo y por par de residuos mediante cabezas de confianza y distograma.
- Condicionamiento por plantillas estructurales (variantes template, v1 y v2).
- Condicionamiento por restricciones: contactos atomo-atomo, contactos token-token, bolsillos (pockets) y subestructuras (variante constraint).
- Condicionamiento por estructura ruidosa (variante structure condition / mini tmpl).
- Integracion con codificador ESM2 en variantes mini ESM/ISM para aprovechar embeddings de lenguaje proteico.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM; es un predictor estructural especializado.
- No dispone de capacidades multilingues ni de generacion de texto.

## Casos de uso

- Prediccion de estructura de proteinas diana para descubrimiento de farmacos: el modelo genera coordenadas atomicas de la proteina y permite acoplar ligandos en el mismo complejo, util para docking y diseno racional de inhibidores.
- Modelado de complejos proteina-ligando: al predecir conjuntamente la proteina y el ligando de bajo peso molecular, resulta adecuado para estudiar sitios de union y evaluar poses de union antes de campanas de cribado.
- Prediccion de estructuras de ARN y complejos proteina-ARN: cubre un hueco donde AlphaFold2 no llega, util en biologia estructural de ribosomas, ribozimas y complejos ribonucleoproteicos.
- Prediccion de estructuras de ADN y complejos proteina-ADN: permite modelar factores de transcripcion, nucleasas y complejos de reparacion del ADN en contextos donde no hay estructura experimental.
- Validacion experimental en cristalografia y crio-microscopia electronica: las cabezas de confianza y el distograma sirven para priorizar constructos y comparar con densidades experimentales.
- Uso en pipelines de biologia computacional de alto rendimiento: la disponibilidad de variantes mini y tiny (134 M y 109 M de parametros) permite desplegar predicciones masivas con menor coste computacional que la version base.
- Modelado con restricciones experimentales: la variante constraint admite contactos, bolsillos y subestructuras, util para refinar modelos con datos de entrecruzamiento, mutagénesis o SAXS.
- Investigacion en diseno de proteinas: condicionamiento por plantillas y estructura permite generar y evaluar candidatos estructurales en workflows de protein design.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repo pesa 1.5 GB en safetensors, lo que da una cota inferior orientativa de memoria para los pesos en precision original, pero el consumo real depende del tamano del complejo de entrada, la profundidad del MSA y los pasos de difusion.
- GPU recomendadas: no disponible. Por el tamano de pesos (~368 M de parametros) y la naturaleza del modelo (difusion con 10 pasos de reciclado sobre representaciones pair), se espera que requiera GPU con memoria suficiente para el complejo de entrada; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; las variantes mini (134 M) y tiny (109 M) son candidatas naturales a GPUs de consumo, pero no se aportan cifras.
- Opciones de despliegue: libreria `ofoldx` (instalable via `pip install ofoldx`), con pipeline `ofoldx.pipeline("fold", model="oteam/protenix-v0.5")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / cobertura | Licencia | Disponibilidad |
|---|---|---|---|---|
| Protenix-v0.5 (este) | 368.123 M | Proteinas, ADN, ARN, ligandos y complejos; 48 bloques Pairformer, 10 reciclados | AGPL-3.0 | Pesos safetensors en HF, libreria ofoldx |
| AlphaFold3 (referencia) | no disponible | Proteinas, acidos nucleicos, ligandos y complejos | no disponible (no liberado publicamente como pesos) | No disponible como pesos abiertos |
| Protenix-v2 | 464.535 M | Igual cobertura, pair=256, condicionado por plantillas | AGPL-3.0 | Pesos via ofoldx (conversion local) |
| Protenix mini v0.5 | 134.102 M | Cobertura equivalente con 16 bloques, 4 reciclados | AGPL-3.0 | Pesos safetensors en HF |

La comparacion con AlphaFold3 es la referencia natural del paper; Protenix se presenta como reproduccion del mismo enfoque. No se dispone de cifras de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Es una implementacion NO OFICIAL de Protenix; la model card la redacta el equipo OFoldX, no los autores originales, por lo que puede haber divergencias respecto al repositorio oficial de ByteDance.
- Modelo de investigacion biologica: no es un LLM y no debe evaluarse con benchmarks de NLP; sus metricas relevantes son estructurales (RMSD, lDDT, TM-score), no disponibles aqui.
- Riesgo de alucinacion estructural: como todo predictor de estructura, puede producir conformaciones plausibles pero incorrectas; las cabezas de confianza deben usarse como filtro, no como garantia.
- Sesgos de datos: no se documenta la composicion del dataset de entrenamiento ni posibles sesgos hacia ciertos tipos de proteinas, organismos o familias estructurales.
- Limitaciones de contexto: la longitud de secuencia, el numero de cadenas y el tamano del complejo estan acotados por recursos de memoria y por el diseno del pipeline; no se especifican maximos.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en productos derivados requiere revision legal cuidadosa, especialmente si se distribuye como servicio en red.
- Sin datos de benchmarks publicados en la informacion disponible: no es posible verificar la precision frente a AlphaFold3 o frente a otros predictores.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Advertencia de produccion: al ser una reproduccion no oficial y sin metricas publicadas, se recomienda validar exhaustivamente contra estructuras experimentales antes de integrarlo en pipelines criticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/protenix-v0.5
- Variante base: https://huggingface.co/oteam/protenix-base
- Variante v1.0 por defecto: https://huggingface.co/oteam/protenix
- Variante v1.0 con corte de datos posterior: https://huggingface.co/oteam/protenix-20250630
- Variante con restricciones: https://huggingface.co/oteam/protenix-constraint
- Variante mini con condicionamiento por estructura: https://huggingface.co/oteam/protenix-mini-tmpl
- Codigo del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/protenix
- Libreria ofoldx: https://ofoldx.valtech.ai/
- Paper (bioRxiv): https://doi.org/10.1101/2025.01.08.631967
- Repositorio oficial de Protenix (ByteDance): https://github.com/bytedance/Protenix
