# Infinix-io/SoulX-Singer

## Resumen

SoulX-Singer es un modelo de síntesis de voz cantada (singing voice synthesis, SVS) de alta fidelidad y zero-shot, desarrollado por el equipo Soul-AILab de Soul APP (repositorio publicado bajo la organización Infinix-io en Hugging Face). Su objetivo es generar voces cantadas realistas para cantantes no vistos durante el entrenamiento, partiendo de una referencia de timbre y controlando de forma precisa el tono, el ritmo y la expresion mediante dos modalidades: condicionamiento por melodia (contorno de F0) y condicionamiento por partitura (notas MIDI).

El modelo se distribuye con licencia Apache 2.0 y pesos en el repositorio de Hugging Face (5,6 GB), junto con un repositorio de preprocesamiento separado (SoulX-Singer-Preprocess) necesario para las etapas previas de inferencia. Soporta ingles y chino, y esta orientado tanto a investigacion academica como a aplicaciones legitimas de sintesis vocal personalizada.

Es relevante porque aborda el problema del zero-shot en SVS, es decir, clonar el timbre de un cantante sin reentrenamiento, manteniendo control musical explicito sobre la interpretacion. La model card no detalla la arquitectura interna ni el numero de parametros, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de sintesis de voz cantada; no se detalla en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 5,6 GB descargado via huggingface_hub) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo (tipo de red, capas, mecanismos de atencion ni tamano). Se describe funcionalmente como un modelo de sintesis de voz cantada que acepta dos vias de control: un contorno de F0 (melodia) o notas MIDI (partitura), lo que permite fijar con precision el tono, el ritmo y la expresion de la interpretacion generada.

Tampoco se especifican el volumen de datos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otros ajustes. La unica innovacion tecnica explicitamente declarada es la capacidad zero-shot para cantantes no vistos, combinada con el doble modo de condicionamiento (melodia y partitura). Para el detalle tecnico completo, la model card remite al informe tecnico y al paper arXiv:2602.07803.

## Capacidades

- Sintesis de voz cantada de alta fidelidad a partir de texto y control musical.
- Generacion zero-shot: permite sintetizar la voz de cantantes no vistos durante el entrenamiento (clonacion de timbre).
- Control por melodia: condicionamiento mediante contorno de F0 para fijar tono y expresion.
- Control por partitura: condicionamiento mediante notas MIDI para fijar tono y ritmo con precision.
- Soporte multilingue limitado a ingles y chino.
- Integracion con un pipeline de preprocesamiento separado (SoulX-Singer-Preprocess) para preparar las entradas de inferencia.
- No se documentan en la model card capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento (thinking).

## Casos de uso

- Prototipado de canciones: generar una linea vocal de prueba a partir de una melodia en F0 o de una partitura MIDI, permitiendo a compositores evaluar arreglos antes de contratar un vocalista.
- Personalizacion de voz para creadores de contenido: clonar el timbre de un cantante de referencia (con su consentimiento) para producir versiones cantadas de textos en ingles o chino.
- Doblaje y localizacion musical: adaptar canciones entre ingles y chino manteniendo el control de tono y ritmo mediante partitura, util en estudios de localizacion.
- Investigacion en SVS: servir como linea base reproducible (licencia Apache 2.0) para experimentos academicos sobre zero-shot singing voice synthesis y control musical.
- Tecnologias de asistencia vocal: generar guias vocales para personas con dificultades para cantar, usando el contorno de F0 como referencia de interpretacion.
- Educacion musical: producir ejemplos cantados de ejercicios de entonacion y ritmo a partir de notas MIDI para practicas de solfeo o entrenamiento auditivo.
- Generacion de demos para bibliotecas musicales: crear maquetas vocales rapidas sobre las que iterar antes de la grabacion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de pesos ocupa 5,6 GB, lo que da una referencia del orden de magnitud del almacenamiento, no de la VRAM necesaria.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar que quepa en tarjetas consumer concretas.
- Opciones de despliegue: inferencia mediante el repositorio oficial de GitHub (script `example/infer.sh`) con entorno conda y Python 3.10; descarga de pesos con `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Solo se declaran soporte para ingles y chino; no hay evidencia de cobertura de otros idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo de clonacion de voz, hereda los sesgos de los datos de entrenamiento (no especificados).
- Riesgo de alucinacion o artefactos vocales: no cuantificado en la informacion disponible.
- Riesgo de uso indebido: la propia model card advierte que el modelo permite clonacion de voz zero-shot y lo restringe a investigacion academica, fines educativos y aplicaciones legitimas; exige consentimiento y uso etico.
- Aunque la licencia es Apache 2.0, el aviso de uso responsable del autor anade una expectativa de uso etico que conviene revisar antes de un despliegue comercial.
- Dependencia de un repositorio de preprocesamiento separado (SoulX-Singer-Preprocess): el pipeline de inferencia no funciona solo con los pesos principales.
- Sin datos publicados de benchmarks, latencia ni requisitos de hardware, la evaluacion en produccion requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/SoulX-Singer
- Repositorio GitHub: https://github.com/Soul-AILab/SoulX-Singer
- Pagina de demo: https://soul-ailab.github.io/soulx-singer/
- Paper arXiv: https://arxiv.org/abs/2602.07803
- Informe tecnico: https://github.com/Soul-AILab/SoulX-Singer/blob/main/assets/technical-report.pdf
- Pesos de preprocesamiento (Hugging Face): Soul-AILab/SoulX-Singer-Preprocess
- Contacto: qianjiale@soulapp.cn, menghao@soulapp.cn, wangxinsheng@soulapp.cn
