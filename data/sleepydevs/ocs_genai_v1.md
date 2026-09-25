# SleepyDevs/ocs_genai_v1

## Resumen

SleepyDevs/ocs_genai_v1 no es un modelo de lenguaje con pesos publicados, sino un repositorio de artefactos de referencia asociado al proyecto OpenCADStudio GenAI adaptation (ocs-genai). El autor lo describe como el conjunto de artefactos de la Definition of Done de la version v1, generado a partir del commit 597ee12 de la rama master del repositorio github:puppybutleragent/ocs-genai (2026-09-24 UTC). El tamano del repositorio en HuggingFace es de 0,0 GB, no declara pipeline, idiomas ni licencia en los metadatos, y acumula 0 descargas y 0 likes desde su creacion el 2026-09-24.

El contenido publicado consiste en salidas de un rasterizador CPU implementado con numpy (mapas clay, depth32f, normal y seg, PNG de segmentacion de 16 bits y ficheros .npy de profundidad), registros RenderRecord en JSON conforme al esquema v0.2 (§9), un drift_report.json y trabajos de estilizado generados con un backend simulado (mock). Se trata, por tanto, de material de reproducibilidad y verificacion de una cadena de render CAD, no de un modelo entrenado que pueda desplegarse para inferencia.

Su relevancia es acotada y de tipo ingenieril: sirve para auditar el cumplimiento de las cuatro puertas de calidad definidas en la §14 de la especificacion v1 del proyecto, para validar el esquema RenderRecord sobre escenas concretas y para disponer de pares de referencia (render + metadatos) en un pipeline CAD con unidades en milimetros y sistema canonico de coordenadas (origen en la esquina suroeste del suelo, +X este, +Y norte, +Z arriba).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se publican pesos ni grafo de computo; el repositorio contiene artefactos de render y validacion) |
| Parametros totales | no disponible (no hay pesos en el repositorio; tamano del repo 0,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no declarada en los metadatos de HuggingFace; la model card indica "our layer MIT; OpenCADStudio stays GPL at the process boundary" |
| Formato de pesos | no hay pesos; los artefactos son .npy (profundidad), PNG (incluido PNG de segmentacion de 16 bits) y JSON (RenderRecord, drift_report) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre arquitectura de red neuronal, numero de parametros, volumen de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF, DPO u otras). El material publicado corresponde a la salida de un rasterizador ejecutado en CPU con numpy, que produce mapas de tipo clay, depth32f, normal y seg, ademas de PNG de segmentacion de 16 bits y arrays de profundidad en formato .npy. Los registros asociados siguen el esquema RenderRecord de la especificacion v0.2 (§9), con schema_version 0.2-v1, e incluyen un drift_report.json.

La model card declara explicitamente varias cautelas de honestidad: las salidas de estilizado (stylize) son de backend mock, deterministicas y sin acceso a red; la prueba en vivo contra gpt-image quedo aplazada por no disponer de clave de edicion de imagen en la maquina de build; y las cifras de drift calculadas sobre salidas mock son comprobaciones de validez del propio mock, no metricas §9 sobre datos reales. El arnes de metricas de la §9 usa como puerta SSIM y edge-IoU, mientras que la pata de profundidad basada en MiDaS es solo diagnostica: no se encontro un umbral discriminante (registrado en la tarjeta t_ea10a943).

En el commit de procedencia, el script run_gate.py reporta las cuatro puertas §14 v1 en verde: (a) round-trip DXF sobre 5 escenas, (b) cero colisiones no detectadas, (c) RenderRecord al 100 % en 10 escenas y (d) drift calculado en todos los trabajos de estilizado. La suite asociada registra 373 pruebas pasadas y 5 omitidas.

## Capacidades

- Generacion de referencias de render CAD: produce mapas clay, depth32f, normal y seg para escenas concretas, con unidades en milimetros y convencion canonica de ejes.
- Serializacion estructurada: emite RenderRecord en JSON conforme al esquema v0.2 (§9, schema_version 0.2-v1) para cada render.
- Segmentacion en 16 bits: incluye PNG de segmentacion de 16 bits y arrays de profundidad en .npy, aptos para evaluacion cuantitativa de pipelines.
- Calculo de drift: genera drift_report.json a partir de los trabajos de estilizado, aunque sobre backend mock.
- Verificacion de integridad geometrica: la puerta (a) cubre round-trip DXF sobre 5 escenas y la puerta (b) verifica ausencia de colisiones no detectadas.
- Ejecucion sin red: el backend de estilizado es deterministico y offline, lo que permite reproducir resultados en entornos aislados.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, multilingue, thinking mode, audio ni voz.

## Casos de uso

- Reproduccion de la Definition of Done v1: ejecutar run_gate.py sobre los artefactos publicados para confirmar las cuatro puertas §14 (round-trip DXF, colisiones, cobertura de RenderRecord al 100 % en 10 escenas y drift calculado) en un entorno propio.
- Regresion de rasterizadores CAD: usar los pares render + RenderRecord como linea base dorada para detectar degradaciones en versiones posteriores del rasterizador numpy (mapas clay, depth32f, normal y seg).
- Generacion de datasets sinteticos supervisados: los mapas normal, depth32f y seg de 16 bits permiten construir pares entrada-salida para entrenar o evaluar modelos de vision aplicada a planos y modelos CAD.
- Validacion de esquemas de metadatos: los RenderRecord v0.2-v1 sirven como fixtures para probar validadores de esquema, migraciones de version y compatibilidad hacia atras en herramientas de la cadena CAD.
- Calibracion de metricas de similitud: el drift_report.json y el arnes SSIM/edge-IoU permiten ajustar umbrales de aceptacion en pipelines de estilizado antes de conectar un backend real.
- Integracion en CI/CD: la suite de 373 pruebas pasadas y 5 omitidas puede replicarse como job de integracion continua para impedir que cambios en el rasterizador rompan contratos de datos.
- Auditoria tecnica de terceros: al ser artefactos deterministas y sin dependencia de red, permiten que un revisor externo verifique afirmaciones de calidad sin acceso a claves de API ni a infraestructura propietaria.
- Pruebas de interoperabilidad DXF: las 5 escenas del round-trip DXF pueden reutilizarse para comprobar lectores y escritores DXF en otras herramientas del ecosistema OpenCADStudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de modelos, y el repositorio no contiene pesos que evaluar.

Los unicos resultados cuantitativos disponibles son los de las puertas de validacion del proyecto, que no constituyen benchmarks de un modelo:

| Puerta §14 v1 | Resultado declarado |
|---|---|
| a: round-trip DXF | 5 escenas |
| b: colisiones no detectadas | cero |
| c: cobertura de RenderRecord | 100 % en 10 escenas |
| d: drift en trabajos de estilizado | calculado en todos los trabajos |
| Suite de pruebas run_gate.py | 373 pasadas / 5 omitidas |

## Requisitos de hardware

- VRAM para inferencia: no aplica. El repositorio no contiene pesos ni requiere GPU para ejecutarse; el rasterizador de referencia es de CPU con numpy.
- GPU recomendadas: no disponible. La generacion de los artefactos publicados no depende de acelerador segun la informacion disponible.
- Cabe en GPU de consumo: no aplica al no haber inferencia de modelo.
- Almacenamiento: el repositorio ocupa 0,0 GB en HuggingFace; el espacio necesario en disco es minimo y viene determinado por los PNG, los .npy y los JSON descargados.
- Opciones de despliegue: no disponibles para el modelo (vLLM, llama.cpp, Ollama o TGI no son aplicables). El despliegue relevante es la ejecucion del pipeline Python del proyecto ocs-genai.
- Latencia y throughput: no disponibles. La model card no publica tiempos de render, de drift ni de ejecucion de la suite de pruebas.
- Nota sobre la pata MiDaS: la model card indica que es diagnostica y que no se hallo umbral discriminante; no se documentan requisitos de hardware asociados a ella.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido habitual porque el repositorio no publica pesos ni declara arquitectura, parametros o contexto. El unico artefacto relacionado identificado es otro repositorio de la misma organizacion, SleepyDevs/ocs-genai, que contiene artefactos de render de la vertical slice del pipeline CPU (UC-5a) procedentes de la rama t_1c3dfbd5-render-pipeline en el commit ea86cff.

| Repositorio | Contenido declarado | Procedencia | Metadatos |
|---|---|---|---|
| SleepyDevs/ocs_genai_v1 | Artefactos de la Definition of Done v1 (reference_renders, RenderRecord, drift_report, stylize mock) | github:puppybutleragent/ocs-genai @ 597ee12 (master) | 0 descargas, 0 likes, sin pipeline, 0,0 GB |
| SleepyDevs/ocs-genai | Artefactos de render de la vertical slice del pipeline CPU (UC-5a) | github:puppybutleragent/ocs-genai, rama t_1c3dfbd5-render-pipeline @ ea86cff | no disponible |

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos, tokenizador, configuracion de arquitectura ni pipeline declarado en HuggingFace, por lo que no puede usarse para inferencia de texto, imagen o codigo.
- Backend simulado: las salidas de estilizado son mock, deterministicas y sin red; no reflejan el comportamiento de un backend real de edicion de imagen.
- Metricas no concluyentes: las cifras de drift sobre salidas mock son comprobaciones de validez del mock y no deben presentarse como metricas §9 en vivo.
- Pata de profundidad no discriminante: el arnes de la §9 usa SSIM y edge-IoU como puertas, mientras que la pata MiDaS es solo diagnostica porque no se encontro umbral separador.
- Licencia ambigua para uso comercial: los metadatos de HuggingFace no declaran licencia; la model card indica MIT para la capa propia y GPL para OpenCADStudio en el limite del proceso, lo que exige revision legal antes de cualquier uso comercial o de redistribucion combinada.
- Validacion nula por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de calidad ni de reproducibilidad independiente.
- Alcance temporal y de version: los resultados de las puertas corresponden a un unico commit de procedencia (597ee12, master, 2026-09-24 UTC); cambios posteriores en el repositorio de origen invalidan la correspondencia.
- Cobertura limitada del conjunto: 5 escenas en el round-trip DXF y 10 escenas en la cobertura de RenderRecord; no se documenta diversidad geometrica, complejidad ni sesgos del conjunto.
- Idiomas y dominios: al no haber modelo, no aplica soporte multilingue; los artefactos son especificos del dominio CAD con unidades en milimetros y convencion canonica de ejes.
- Riesgo de malinterpretacion: el nombre del repositorio puede sugerir un modelo generativo, cuando su contenido es un conjunto de artefactos de validacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SleepyDevs/ocs_genai_v1
- Repositorio relacionado de la misma organizacion: https://huggingface.co/SleepyDevs/ocs-genai
- Perfil de la organizacion en HuggingFace: https://huggingface.co/SleepyDevs/models
- Repositorio de origen segun provenance de la model card: github:puppybutleragent/ocs-genai @ 597ee12 (master, 2026-09-24 UTC)
- Repositorio de origen del artefacto relacionado: github:puppybutleragent/ocs-genai, rama t_1c3dfbd5-render-pipeline @ ea86cff
- Referencia interna citada en la model card: tarjeta t_ea10a943 (hallazgo de ausencia de umbral discriminante en la pata MiDaS)
