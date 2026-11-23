# iatecoding/Mena-LAM-6

## Resumen

Mena-LAM-6 es un potencial interatómico aprendido por máquina (machine-learned interatomic potential, MLIP) desarrollado por Francesco Viola dentro del proyecto independiente Mena-Lab. A diferencia de un modelo de lenguaje, su función es predecir energías y fuerzas de sistemas atómicos —cristales, superficies, catalizadores y moléculas— para su uso en simulaciones de dinámica molecular y relajaciones estructurales con precisión cercana a la de métodos de química cuántica, pero a un coste computacional mucho menor. Es el modelo de materiales por defecto de Mena-Lab y se distribuye como pesos PyTorch de 34,0 MB (`mena-lam6-v1.pt`).

El modelo incorpora además "cabezas" de interpretación física integradas: estimación del gap HOMO-LUMO, carácter de electrones desapareados, repulsión por solapamiento de Pauli, energía de intercambio de espín y cargas parciales. Esta combinación de predicción energética con descriptores físicos interpretables es poco habitual en los MLIP publicados y constituye su principal singularidad.

Es relevante ahora porque el ecosistema de potenciales universales (MACE, CHGNet, M3GNet, Orb, SevenNet) está madurando rápidamente y Mena-LAM-6 se posiciona como una alternativa de licencia permisiva (CC BY 4.0) entrenada sobre los principales conjuntos de datos atomísticos abiertos. No obstante, el repositorio no incluye paper asociado, la información técnica publicada es escasa y el modelo no registra descargas ni validación externa en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de potencial interatómico aprendido por máquina; no se especifica la familia arquitectónica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no aplica (modelo atomístico, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de química y ciencia de materiales) |
| Licencia | CC BY 4.0 para los pesos; Apache-2.0 para el código de Mena-Lab |
| Formato de pesos | PyTorch (`.pt`, fichero `mena-lam6-v1.pt`, 34,0 MB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo: no se indica si se trata de un grafo de mensajes (message-passing neural network), un equivariante tipo E(3), un transformer sobre grafos atómicos ni una combinación híbrida. Tampoco se publican el número de parámetros, el número de capas, el radio de corte de interacción ni el esquema de entrenamiento (función de pérdida, ponderación de energías frente a fuerzas, número de épocas). Lo único verificable es que los pesos se distribuyen en formato PyTorch y que el modelo se carga mediante el paquete `mena-lab` desde Python.

El entrenamiento se realizó sobre una composición amplia de conjuntos de datos atomísticos abiertos: OMol25, MPtrj, sAlex, OMat24, MatPES, OC20, OC25, MAD-1.6, OMC25 y SPICE 2. Esta mezcla cubre moléculas, materiales inorgánicos, superficies de catálisis y datos de alta precisión, lo que explica la pretensión del autor de un modelo único para cristales, superficies, catálisis y moléculas. La innovación técnica destacable no es arquitectónica sino funcional: las cabezas de interpretación física (gap HOMO-LUMO, electrones desapareados, repulsión de Pauli, intercambio de espín y cargas parciales) se predicen junto con la energía y las fuerzas, algo que la mayoría de MLIP no ofrece de forma nativa.

## Capacidades

- Predicción de energías y fuerzas atómicas para cristales, superficies, catalizadores y moléculas.
- Relajación estructural de geometrías (por ejemplo, a partir de ficheros CIF) mediante el comando `mena relax`.
- Simulaciones de dinámica molecular con potencial interatómico aprendido.
- Estimación del gap HOMO-LUMO como descriptor electrónico.
- Predicción de carácter de electrones desapareados y de energía de intercambio de espín.
- Modelado de repulsión por solapamiento de Pauli.
- Asignación de cargas parciales atómicas.
- Integración como calculadora ASE (`atoms.calc = calculator("lam6-v1")`).
- Interfaz web y de línea de comandos a través de Mena-Lab.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Cribado de materiales para baterías: el modelo puede relajar estructuras candidatas de cátodos y electrolitos y estimar energías relativas, sustituyendo cálculos DFT costosos en la fase de filtrado previo.
- Catálisis heterogénea: al estar entrenado sobre OC20 y OC25, permite calcular energías de adsorción sobre superficies metálicas y comparar sitios activos en estudios de reacción.
- Dinámica molecular de alta temperatura: con fuerzas predichas a 0,40 kcal/mol/Å en validación de OMol25, es viable para explorar estabilidad térmica y transiciones de fase en cristales.
- Análisis de propiedades electrónicas aproximadas: las cabezas de gap HOMO-LUMO y electrones desapareados permiten filtrar candidatos con carácter magnético o semiconductor sin lanzar DFT completo.
- Estudio de moléculas y complejos: el entrenamiento sobre SPICE 2 y OMol25 lo hace adecuado para conformaciones moleculares y cálculos de energía de interacción.
- Docencia e investigación exploratoria: al ser ligero (34 MB) y de licencia CC BY 4.0, es apto para prototipos en entornos con recursos limitados y para reproducir experimentos docentes de simulación atomística.
- Integración en pipelines de descubrimiento de materiales: mediante la API de calculadora ASE, puede encadenarse con herramientas de optimización y generación de estructuras.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| Matbench Discovery | CPS | 0,874 |
| Matbench Discovery | F1 | 0,904 |
| Matbench Discovery | κ<sub>SRME</sub> | 0,182 |
| OMol25 (validacion) | Error de energia | 2,00 kcal/mol |
| OMol25 (validacion) | Error de fuerzas | 0,40 kcal/mol/Å |

No se han publicado en la información disponible resultados comparativos adicionales (por ejemplo, MAE de energía por átomo en MPtrj, latencia o throughput) ni la metodología exacta de evaluación. Los valores proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos ocupan 34,0 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, y probablemente también en CPU para sistemas de pocos cientos de átomos.
- GPU recomendadas: no se especifican en la documentación. Por el tamaño del modelo, una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para el modelo en sí; el cuello de botella será el tamaño del sistema atómico y el número de pasos de dinámica molecular.
- Cabe en GPU consumer: sí, con margen amplio; el factor limitante es la memoria necesaria para las vecindades atómicas del sistema simulado, no los pesos.
- Opciones de despliegue: paquete `mena-lab` (pip desde GitHub), interfaz web `mena webapp`, CLI `mena relax`, y uso como calculadora ASE. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. No se publican tiempos por paso de dinámica molecular ni escalado con el número de átomos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / alcance | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mena-LAM-6 | MLIP universal | no disponible | Cristales, superficies, catálisis y moléculas | CC BY 4.0 (pesos), Apache-2.0 (código) | Hugging Face + GitHub |
| MACE-MP-0 | MLIP universal | no disponible en esta ficha | Materiales inorgánicos | MIT (según su repositorio) | Abierto |
| CHGNet | MLIP universal | no disponible en esta ficha | Materiales inorgánicos | MIT (según su repositorio) | Abierto |
| Orb / Orb-v2 | MLIP universal | no disponible en esta ficha | Materiales y moléculas | Abierto (verificar licencia) | Abierto |

No se dispone de datos de benchmarks comparables entre Mena-LAM-6 y estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad. Cualquier afirmación de superioridad o inferioridad requeriría una evaluación independiente sobre los mismos conjuntos de test.

## Limitaciones y advertencias

- Ausencia de paper: el autor indica que hasta la publicación de un artículo companion debe citarse el repositorio de Mena-Lab; no hay revisión por pares de la metodología ni de los benchmarks.
- Validación externa nula: el repositorio registra 0 descargas y 0 likes, y los resultados de Matbench Discovery y OMol25 proceden únicamente de la model card.
- Arquitectura no documentada: no se especifican parámetros, radio de corte, esquema de entrenamiento ni estrategia de balanceo de los diez conjuntos de datos, lo que dificulta evaluar su robustez fuera de distribución.
- Riesgo de extrapolación: como todo MLIP, puede fallar en composiciones, estados de oxidación o condiciones de presión y temperatura poco representadas en los datos de entrenamiento (OMol25, MPtrj, sAlex, OMat24, MatPES, OC20, OC25, MAD-1.6, OMC25, SPICE 2).
- Cabezas físicas aproximadas: el gap HOMO-LUMO, las cargas parciales y la energía de intercambio de espín son estimaciones aprendidas, no resultados de DFT; no deben usarse como sustituto de cálculos electrónicos rigurosos.
- Licencia CC BY 4.0: permite uso comercial y modificaciones, pero exige atribución a Francesco Viola y a los conjuntos de datos originales citados en la model card.
- Mantenimiento incierto: proyecto personal desarrollado con recursos propios y en tiempo libre; no hay garantía de soporte, actualizaciones ni corrección de errores.
- Idiomas y texto: no aplica; no debe confundirse con un modelo de lenguaje pese a compartir infraestructura de distribución en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iatecoding/Mena-LAM-6
- Repositorio Mena-Lab: https://github.com/iatecoding/mena-lab
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Matbench Discovery: no disponible en la información proporcionada
- OMol25: no disponible en la información proporcionada
- Paper asociado: no disponible (pendiente de publicación según el autor)
