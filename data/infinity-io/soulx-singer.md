# Infinity-io/SoulX-Singer

## Resumen

SoulX-Singer es un modelo de síntesis de voz cantada (singing voice synthesis, SVS) de alta fidelidad y zero-shot, desarrollado por Infinity-io (Soul-AILab). Su objetivo es generar voces cantadas realistas para intérpretes no vistos durante el entrenamiento, a partir de una referencia de voz y una partitura o contorno melódico. Resuelve el problema de la clonación de voz cantada sin necesidad de reentrenamiento por cantante, algo crítico en producción musical y doblaje.

El modelo admite dos modos de control: condicionado por melodía (contorno de F0) y condicionado por partitura (notas MIDI), lo que permite controlar con precisión el tono, el ritmo y la expresión. Está pensado para investigación académica y aplicaciones legítimas como síntesis vocal personalizada y tecnologías de asistencia.

La información disponible no detalla la arquitectura interna, el número de parámetros ni la longitud de contexto. El repositorio ocupa 5,6 GB y se distribuye bajo licencia Apache 2.0, con soporte para inglés y chino. La model card remite al paper arXiv:2602.07803 y a un informe técnico para los detalles de arquitectura y entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz cantada; detalles en el paper arXiv:2602.07803) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 5,6 GB; descarga vía `huggingface_hub`) |

## Arquitectura y entrenamiento

La información proporcionada no especifica la arquitectura interna del modelo (transformer, difusión, modelo híbrido u otra), ni el número de tokens de entrenamiento, la composición del dataset o si se emplearon técnicas de RLHF/DPO. La model card únicamente describe el comportamiento funcional: síntesis de voz cantada zero-shot con control condicionado por melodía (contorno de F0) y por partitura (notas MIDI).

Como innovación destacable, el modelo separa el control de tono y ritmo mediante dos modalidades de condicionamiento, lo que permite una reproducción precisa de la expresividad musical. Para los detalles técnicos de arquitectura y entrenamiento, la model card remite explícitamente al paper arXiv:2602.07803 y al informe técnico alojado en el repositorio de GitHub.

## Capacidades

- Síntesis de voz cantada (SVS) de alta fidelidad para intérpretes no vistos (zero-shot voice cloning).
- Control condicionado por melodía mediante contorno de F0.
- Control condicionado por partitura mediante notas MIDI.
- Control preciso de tono, ritmo y expresión musical.
- Soporte multilingüe limitado a inglés y chino.
- Generación de audio a partir de texto y referencia de voz (pipeline `text-to-speech`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Producción musical y demos: generar una línea vocal completa a partir de una partitura MIDI y una muestra de voz de referencia, útil para maquetas previas a la grabación con un cantante real.
- Doblaje y localización de canciones: adaptar una voz cantada a otro idioma (inglés o chino) manteniendo la melodía original mediante condicionamiento por F0.
- Clonación de voz cantada personalizada: crear una voz sintética a partir de una muestra corta para proyectos creativos o contenido generado por el usuario.
- Tecnologías de asistencia: permitir a personas con dificultades del habla o del canto generar voces cantadas a partir de una referencia y una partitura.
- Investigación en síntesis de audio: servir como modelo de referencia zero-shot para experimentos académicos sobre SVS y clonación de voz.
- Prototipado rápido en estudios: iterar sobre arreglos vocales sin necesidad de contratar intérpretes en fases tempranas.
- Educación musical: generar ejemplos cantados de una partitura para prácticas de entonación o análisis melódico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 5,6 GB, lo que da una referencia del tamaño de los pesos, pero no se especifica el consumo en memoria durante la inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el flujo documentado se basa en un entorno Conda (Python 3.10), `pip install -r requirements.txt` y ejecución mediante `bash example/infer.sh`, con descarga de pesos vía `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de audio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| SoulX-Singer | no disponible | no disponible | Apache 2.0 | en, zh |
| Alternativas de SVS zero-shot | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se documentan los idiomas inglés y chino; el rendimiento en otros idiomas no está garantizado.
- No se publican datos de sesgo, robustez ni tasas de alucinación (en audio, artefactos o desviaciones de la melodía objetivo).
- La clonación de voz zero-shot plantea riesgos de suplantación de identidad y uso indebido; el autor recomienda restringir su uso a investigación académica, fines educativos y aplicaciones legítimas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el aviso de uso del autor enfatiza la responsabilidad ética y la necesidad de consentimiento para clonar voces.
- No se especifican requisitos de hardware ni límites de longitud de audio de entrada, lo que dificulta planificar despliegues en producción.
- El modelo se distribuye con `library_name: huggingface_hub` y un script de inferencia propio; no hay integración estandarizada con frameworks de serving.

## Enlaces

- Hugging Face: https://huggingface.co/Infinity-io/SoulX-Singer
- Paper (arXiv): https://arxiv.org/abs/2602.07803
- Repositorio GitHub: https://github.com/Soul-AILab/SoulX-Singer
- Página de demo: https://soul-ailab.github.io/soulx-singer/
- Informe técnico: https://github.com/Soul-AILab/SoulX-Singer/blob/main/assets/technical-report.pdf
- Pesos de preprocesado: https://huggingface.co/Soul-AILab/SoulX-Singer-Preprocess
