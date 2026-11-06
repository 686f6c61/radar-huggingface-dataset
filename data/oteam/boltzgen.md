# oteam/boltzgen

## Resumen

BoltzGen es un modelo de difusión atomística para el diseño de binders biomoleculares (proteinas y peptidos) desarrollado por Hannes Stark, Felix Faltings y un amplio equipo de investigadores del MIT, el Broad Institute y otras instituciones, publicado en bioRxiv en noviembre de 2025. El modelo genera de forma conjunta secuencia y estructura tridimensional mediante un esquema de difusión EDM guiado por restricciones, apoyado en un trunk de tipo Pairformer con reciclaje que combina caracteristicas de atomos, tokens, MSA, plantillas, contactos, sitio de union y estructura secundaria. Resuelve el problema del diseño computacional de binders: dada una proteina diana, proponer secuencias y esqueletos que se unan a ella con alta afinidad y solubilidad.

La implementacion publicada en Hugging Face bajo el identificador `oteam/boltzgen` es una version NO oficial del modelo original, mantenida por el equipo OFoldX, que empaqueta todo el flujo de trabajo en siete subpipelines: generadores de estructura (diverse y adherence), inversores de secuencia (BoltzIF y SolubleMPNN), replegado y puntuacion de afinidad con Boltz-2, y replegado con ESMFold2. El modelo completo tiene 482,2 millones de parametros en sus variantes principales, con una variante reducida de 136,9 millones y un modelo de inverse folding de tan solo 3,07 millones.

Es relevante ahora porque el diseno generativo de proteinas esta pasando de la prediccion de estructura (AlphaFold) al diseno racional de nuevas moleculas funcionales, y BoltzGen propone un enfoque unificado que cubre proteinas, peptidos, nanobodies, anticuerpos y moleculas pequenas con un unico pipeline. La licencia AGPL-3.0 y la dependencia de la libreria propietaria `ofoldx` son factores criticos a evaluar antes de adoptarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion atomistica con trunk Pairformer reciclado y denoiser EDM; inverse folding basado en grafo |
| Parametros totales | 482,213 M (diverse/adherence); 136,886 M (structure-small); 3,069 M (inverse folding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre estructuras atomicas, no sobre tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BoltzGen es un modelo de difusion de tipo EDM (Equivariant Diffusion Model) que opera sobre representaciones atomisticas completas. El trunk es un Pairformer con reciclaje que integra multiples fuentes de caracteristicas: atomos, tokens, alineamientos multiples de secuencia (MSA), plantillas estructurales, mapas de contacto, informacion del sitio de union y estructura secundaria. Sobre esta representacion, un denoiser genera simultaneamente la secuencia y las coordenadas atomicas de la molecula disenada. La variante principal emplea 64 bloques Pairformer y 4 bloques MSA en el trunk, con 24 bloques de tokens en el denoiser; la variante pequena sustituye el Pairformer por 12 bloques Miniformer y 3 de MSA, con 8 bloques de tokens.

El flujo completo incorpora un modelo separado de inverse folding (BoltzIF) que puede redisenar la secuencia sobre un esqueleto generado, con 6 bloques de encoder de grafo (30 vecinos) y 3 bloques de decoder. El pipeline de evaluacion incluye replegado con Boltz-2 y con ESMFold2, ademas de puntuacion de afinidad. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. La innovacion principal es la generacion conjunta de secuencia y estructura guiada por restricciones explicitas (sitio de union, estructura secundaria), lo que permite condicionar el diseno a requisitos funcionales concretos.

## Capacidades

- Generacion conjunta de secuencia y estructura atomistica de proteinas y peptidos mediante difusion.
- Diseno de binders condicionado a una proteina diana con protocolos especificos: `protein-anything`, `peptide-anything`, `protein-small_molecule`, `nanobody-anything`, `antibody-anything` y `protein-redesign`.
- Inverse folding: rediseno de secuencia sobre un esqueleto fijo mediante BoltzIF o SolubleMPNN.
- Evaluacion integrada mediante replegado (Boltz-2 y ESMFold2) y puntuacion de afinidad.
- Soporte de contexto fijo de ARN y ADN (no como segmentos generables, solo como contexto).
- Generacion de multiples candidatos con ranking, seleccion por presupuesto y seleccion por diversidad.
- Modo de generacion parcial: `design_backbones()` para estructura y secuencia sin evaluacion, e `inverse_fold()` para rediseno sin evaluacion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step en el sentido de los LLM; es un modelo biologico especializado.

## Casos de uso

- Diseno de binders proteicos contra dianas terapeuticas: el pipeline `protein-anything` permite generar candidatos de union a una proteina diana concreta, con replegado y puntuacion de afinidad integrados para priorizar los mejores disenos antes de validacion experimental.
- Desarrollo de peptidos bioactivos: el protocolo `peptide-anything` genera peptidos con longitud controlada (`total_len`) que pueden servir como punto de partida para farmacos peptidicos o sondas moleculares.
- Ingenieria de nanobodies y anticuerpos: los protocolos `nanobody-anything` y `antibody-anything` permiten disenar dominios variables con restricciones sobre la region de union, utiles en el desarrollo de biologics.
- Rediseno de proteinas existentes: el protocolo `protein-redesign` y la funcion `inverse_fold()` permiten mantener un esqueleto estructural conocido y optimizar la secuencia para mejorar solubilidad o estabilidad, usando SolubleMPNN como inversor por defecto.
- Diseno de binders contra moleculas pequenas: el protocolo `protein-small_molecule` con BoltzIF como inversor por defecto permite generar proteinas que reconozcan ligandos de bajo peso molecular, relevante en biosensores y enzimas artificiales.
- Filtrado computacional previo a campanas experimentales: la generacion de multiples candidatos (`num_candidates`) con ranking y seleccion por diversidad permite reducir el espacio de busqueda experimental a decenas de disenos plausibles, ahorrando costes de sintesis y ensayo.
- Integracion en pipelines de descubrimiento de farmacos: la API programatica (`ofoldx.pipeline("design", ...)`) permite automatizar la generacion y evaluacion de candidatos dentro de flujos de trabajo bioinformaticos mas amplios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El tamano del repositorio (8,9 GB) sugiere pesos en precision completa o mixta para el conjunto de subpipelines, pero no se especifica el consumo de memoria en ejecucion.
- GPU recomendadas: no disponible. Dado el caracter atomistico del modelo (representaciones densas de pares de atomos) y el uso de 64 bloques Pairformer, es previsible que requiera GPU de datacenter, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la unica via documentada es la libreria `ofoldx` (`pip install ofoldx`), que expone el pipeline `ofoldx.pipeline("design", model="oteam/boltzgen")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BoltzGen (oteam/boltzgen) | 482,2 M (principal); 3,07 M (inverse folding) | no aplica | Difusion atomistica para diseno de binders + inverse folding | AGPL-3.0 | Hugging Face (implementacion no oficial) |
| Boltz-2 | no disponible | no disponible | Prediccion de estructura y afinidad | no disponible | Referenciado como subpipeline de evaluacion |
| ESMFold2 | no disponible | no disponible | Prediccion de estructura proteica | no disponible | Referenciado como subpipeline de evaluacion |
| SolubleMPNN | no disponible | no aplica | Inverse folding | no disponible | Inversor por defecto del pipeline |

La informacion proporcionada no incluye especificaciones detalladas de Boltz-2, ESMFold2 ni SolubleMPNN mas alla de su papel como subcomponentes del flujo de BoltzGen, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Implementacion NO oficial: el equipo autor de BoltzGen no escribio esta model card ni necesariamente respalda esta version. Para uso critico, debe contrastarse con el repositorio oficial `HannesStark/boltzgen`.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte. El uso comercial en servicios en red puede requerir la publicacion del codigo fuente derivado; debe revisarse con asesoria legal antes de integrarlo en productos propietarios.
- Dependencia de la libreria `ofoldx`: el modelo no es utilizable de forma autonoma sin esta libreria, lo que introduce un punto unico de dependencia y posibles riesgos de mantenimiento.
- Riesgo de falsos positivos en el ranking: la model card advierte que, en el rediseno de cadena unica, las puntuaciones iPTM entre cadenas usan la convencion de interfaz vacia del trabajo original y no describen una interfaz real, lo que puede dejar candidatos empatados en el ranking.
- Coordenadas de cadena lateral incompletas: cuando el inverse folding cambia la identidad de un residuo, las nuevas coordenadas de cadena lateral no estan disponibles hasta una prediccion estructural posterior.
- Limitacion en acidos nucleicos: ARN y ADN solo pueden usarse como contexto fijo, no como segmentos generables.
- Cobertura atomica variable: el cribado usa los atomos disponibles y cada analisis conserva su propia cobertura atomica, reportando metricas de quimica completa por separado solo cuando estan disponibles.
- Sesgos: no se documentan sesgos especificos en la informacion proporcionada; al ser un modelo entrenado sobre estructuras biologicas conocidas, es previsible un sesgo hacia familias proteicas sobrerrepresentadas en las bases de datos estructurales.
- Alucinacion: no aplica en el sentido linguistico, pero existe el riesgo biologico de generar disenos estructuralmente plausibles pero no funcionales o no expresables, que solo la validacion experimental puede descartar.
- Ausencia de benchmarks publicados en la informacion disponible: no es posible evaluar su rendimiento relativo frente a alternativas con datos objetivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/boltzgen
- Variante diverse: https://huggingface.co/oteam/boltzgen-diverse
- Variante adherence: https://huggingface.co/oteam/boltzgen-adherence
- Variante structure-small: https://huggingface.co/oteam/boltzgen-structure-small
- Variante inverse folding: https://huggingface.co/oteam/boltzgen-inversefolding
- Paper: https://doi.org/10.1101/2025.11.20.689494
- Repositorio oficial: https://github.com/HannesStark/boltzgen
- Codigo de la implementacion OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/boltzgen
- Libreria ofoldx: https://ofoldx.valtech.ai/
