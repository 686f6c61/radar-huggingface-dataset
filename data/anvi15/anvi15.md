# Anvi15/Anvi15

## Resumen

Anvi15/Anvi15 no es un modelo de lenguaje entrenado, sino un repositorio de perfil personal alojado en Hugging Face. Su contenido es una model card escrita por Anvi Gogia, estudiante de Ingenieria en Ciencias de la Computacion (IA y ML) en Chitkara University (Punjab, India, promocion 2024-2028), que la utiliza como pagina de presentacion de su trayectoria, proyectos y modelos publicados. El repositorio no incluye pesos, configuracion de arquitectura ni artefactos de inferencia.

El texto describe intereses tecnicos en reconocimiento de voz (whisper.cpp, Silero VAD), biometria facial y de voz, pipelines de agentes con FastAPI, Gemini y Azure AI, y despliegue en dispositivo (edge AI). Menciona un modelo propio publicado aparte, `Anvi15/student-performance-dnn`, un clasificador MLP de Keras con 4.547 parametros para riesgo academico, y varios proyectos de software como Resume Doctor, Vortex HTTP Server, Restock.ai y ADEP 2.0.

Su relevancia actual es nula como modelo evaluable: no hay pipeline declarado, no hay licencia, no hay idiomas declarados y el contador de descargas y likes es cero en el momento de la consulta. Cualquier evaluacion tecnica de capacidades, contexto o rendimiento es imposible con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene una model card de perfil, no pesos) |

## Arquitectura y entrenamiento

No disponible. El repositorio no declara arquitectura de red, datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion como RLHF o DPO. La model card es un perfil biografico y de proyectos, no una ficha de modelo.

El unico modelo con arquitectura descrita en el texto es `Anvi15/student-performance-dnn`, externo a este repositorio: un perceptron multicapa de Keras con 4.547 parametros, entrenado sobre el dataset UCI Student Performance, con escaladores y codificadores ajustados solo sobre los splits de entrenamiento para evitar fuga de datos. No se detalla numero de capas, funciones de activacion ni hiperparametros de optimizacion.

## Capacidades

- El repositorio no expone ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas ni vision, al no contener pesos ni pipeline de inferencia.
- No hay soporte declarado de tool calling ni de function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingues declaradas.
- El contenido describe, a nivel de perfil profesional, experiencia del autor en reconocimiento de voz offline con whisper.cpp y Silero VAD, biometria facial y de voz, y orquestacion de agentes supervisores con Azure AI Foundry y Google ADK, pero esas capacidades pertenecen a los proyectos del autor, no a este repositorio.

## Casos de uso

- Consulta de perfil profesional: el repositorio sirve como curriculum tecnico publico del autor, con enlaces a GitHub, LinkedIn, LeetCode y correo de contacto, util para reclutadores o colaboradores que evaluen su trayectoria.
- Referencia de portafolio de proyectos: permite localizar implementaciones concretas como Vortex HTTP Server (HTTP/1.1 sobre sockets POSIX en C++17, con aproximadamente 5.000 peticiones por segundo y p95 de 9 ms) o Resume Doctor (FastAPI, Azure AI Foundry, React, con 53 tests).
- Punto de entrada a modelos del autor: redirige al modelo `Anvi15/student-performance-dnn`, que si es un artefacto entrenado y evaluable, con 86,92 por ciento de exactitud en el conjunto de test retenido de 130 estudiantes y 0,929 de ROC-AUC.
- Demostracion de practicas de privacidad: el proyecto Resume Doctor documenta redaccion de PII antes de cualquier llamada al modelo y una traza de auditoria visible, util como ejemplo de diseno de pipelines con privacidad como restriccion de primer nivel.
- Ejemplo de orquestacion de agentes: el espacio Resume Doctor ilustra un agente supervisor que elige entre cuatro herramientas en tiempo de ejecucion (parse_resume, redact_pii, score_ats, match_jd) con modo mock offline determinista, aprovechable como referencia docente.
- Localizacion de recursos sobre edge AI: los intereses declarados (whisper.cpp, GGUF, cuantizacion, inferencia en dispositivo) sirven como indice de temas para quien busque material introductorio en ese area.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. Los unicos datos numericos del texto pertenecen a proyectos y modelos externos y se recogen a continuacion solo como referencia contextual, no como rendimiento de Anvi15/Anvi15.

| Artefacto | Metrica | Valor |
|---|---|---|
| student-performance-dnn (modelo externo) | Exactitud en test (130 estudiantes) | 86,92 % |
| student-performance-dnn (modelo externo) | Precision dentro de un nivel | 100 % |
| student-performance-dnn (modelo externo) | ROC-AUC | 0,929 |
| Baseline Random Forest (modelo externo) | Exactitud en test | 90,77 % |
| Vortex HTTP Server (proyecto) | Throughput | ~5.000 req/s |
| Vortex HTTP Server (proyecto) | Latencia p95 | ~9 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no existir pesos ni arquitectura declarada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No procede. Anvi15/Anvi15 no es un modelo de lenguaje ni un artefacto de inferencia, por lo que no existe una categoria de modelos comparables. El unico modelo del autor con parametros descritos es `Anvi15/student-performance-dnn` (MLP de 4.547 parametros para clasificacion tabular de riesgo academico), cuya comparativa natural seria con clasificadores tabulares como Random Forest o XGBoost sobre el dataset UCI Student Performance; el propio texto aporta un baseline de Random Forest con 90,77 por ciento de exactitud frente al 86,92 por ciento del MLP.

| Criterio | Anvi15/Anvi15 | student-performance-dnn | Baseline Random Forest (citado) |
|---|---|---|---|
| Tipo | Repositorio de perfil | Clasificador tabular MLP | Clasificador tabular de conjuntos |
| Parametros | no disponible | 4.547 | no disponible |
| Contexto | no disponible | no aplica | no aplica |
| Exactitud en test | no disponible | 86,92 % | 90,77 % |
| Licencia | no disponible | no disponible | no aplica |
| Disponibilidad | Solo model card | Pesos publicados | No publicado por el autor |

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos, tokenizador, configuracion ni pipeline, por lo que no puede desplegarse ni evaluarse tecnicamente.
- Ausencia total de licencia: no se concede permiso explicito de uso, copia, modificacion ni redistribucion del contenido, lo que impide su uso comercial o su incorporacion a productos derivados sin autorizacion del autor.
- Sesgos conocidos: no disponibles, al no existir datos de entrenamiento ni evaluaciones.
- Riesgo de alucinacion: no aplica en sentido estricto, pero el repositorio podria confundirse con un modelo real en busquedas automatizadas o indices de Hugging Face; conviene verificar el pipeline antes de referenciarlo.
- Limitaciones de contexto e idioma: no disponibles; el contenido esta redactado en ingles.
- Datos potencialmente desactualizados: el repositorio se creo y actualizo en noviembre de 2026 segun los metadatos, y las cifras de proyectos y certificaciones corresponden a la fecha de redaccion de la model card.
- Contenido promocional: la model card incluye afirmaciones sobre certificaciones (Microsoft AI-103) y una solicitud de patente india (Journal 19/2026) que no se verifican de forma independiente en la informacion proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Anvi15/Anvi15
- Perfil de Hugging Face del autor: https://huggingface.co/Anvi15
- Modelo student-performance-dnn: https://huggingface.co/Anvi15/student-performance-dnn
- Espacio Resume Doctor: https://huggingface.co/spaces/Anvi15/resume-doctor
- GitHub del autor: https://github.com/Anvi-g
- Repositorio Resume Doctor: https://github.com/Anvi-g/resume_doctor
- Repositorio Vortex HTTP Server: https://github.com/Anvi-g/vortex-http-server
- Repositorio Restock.ai: https://github.com/Anvi-g/restock.ai
- Repositorio ADEP 2.0: https://github.com/Allen203060/ADEP2.0
- LinkedIn del autor: https://linkedin.com/in/anvi-gogia
- LeetCode del autor: https://leetcode.com/u/Anvi_gogia101/
- Correo de contacto: gogiaanvi@gmail.com
