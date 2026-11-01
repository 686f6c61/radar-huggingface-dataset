# mindsoulBCI/mindsoul-direction

## Resumen

MindSoul Direction es un modelo anunciado por mindsoulBCI (equipo MindSoul, vinculado a Chengdu (Shanghai) Brain Cloud Matrix Technology Co., Ltd.) para la decodificación de señales EEG en tareas de selección de dirección (arriba, abajo, izquierda, derecha) dentro de experimentos de interacción espacial. El objetivo declarado es mapear la intención direccional decodificada a comandos de navegación o selección en interfaces espaciales como Android XR, visionOS, PICO OS 6 y PC. Forma parte de la serie de investigación Neural AI del equipo de modelos base de interfaz cerebro-ordenador.

El repositorio es, a fecha de la información disponible, únicamente un anuncio de publicación: no incluye pesos descargables, código de entrenamiento, configuración de inferencia ni resultados de evaluación. La model card indica explícitamente que la arquitectura Transformer es la dirección de modelado prevista, pero que la arquitectura concreta, las entradas y salidas y la configuración de entrenamiento se publicarán en la versión formal. Por tanto, no es posible evaluar el modelo ni utilizarlo hoy.

Su relevancia es prospectiva: si se materializa, cubriría el nicho de decodificación EEG de intención direccional para control de interfaces XR, un área con pocos modelos publicados y con requisitos estrictos de latencia y tasa de falsos positivos. La licencia es de investigación personal no comercial, lo que limita su adopción en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (dirección de modelado prevista; arquitectura concreta no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en |
| Licencia | mindsoul-personal-research (other); solo investigación personal no comercial, otro uso requiere autorización |
| Formato de pesos | no disponible (no hay pesos publicados) |

## Arquitectura y entrenamiento

La model card describe un enfoque basado en Transformer para extraer características relevantes de la tarea a partir de señales EEG y mapear las clases direccionales definidas por la tarea a comandos de navegación o selección. No se especifica el número de capas, dimensión del modelo, mecanismo de tokenización de la señal EEG, ventana temporal de entrada ni estrategia de fusión de canales. Tampoco se detalla si se trata de un encoder puro, un modelo de clasificación con cabeza lineal o un modelo generativo.

En cuanto a datos y entrenamiento, el autor indica que planea reportar divisiones a nivel de sujeto (entrenamiento, validación y prueba) distinguiendo evaluación intra-sujeto y cross-sujeto, junto con la versión de los datos, las condiciones del dispositivo, las líneas base y los casos de fallo. No hay información sobre volumen de datos, número de sujetos, paradigma (imaginería motora, potenciales evocados, tareas de selección guiada), composición del dataset, ni sobre uso de RLHF, DPO u otras etapas de ajuste. Los datos previstos se publicarán tras desidentificación y verificación de autorización de compartición, pero la model card advierte que no prueba que ya existan datos desidentificados ni un modelo entrenado.

## Capacidades

- Decodificación de señales EEG en tareas de selección de dirección (arriba, abajo, izquierda, derecha), según la definición de tarea del autor.
- Mapeo planificado de clases direccionales decodificadas a comandos de navegación o selección en interfaces espaciales.
- Extracción de características con Transformer orientada a la tarea (planteamiento previsto, sin implementación publicada).
- Idiomas declarados: chino y inglés (referido a la documentación y al contexto del proyecto; no implica capacidad lingüística del modelo).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Integración con clientes XR (Android XR, visionOS, PICO OS 6, PC): anunciada como dirección de trabajo, sin integración verificable publicada.

## Casos de uso

- Control de menús y navegación en visores XR: el modelo se usaría para traducir la intención direccional del usuario en desplazamientos o selección de elementos de una interfaz espacial, reduciendo la dependencia de mandos. Requiere validar latencia online y tasa de falsos disparos, métricas que el autor dice que reportará.
- Accesibilidad para usuarios con movilidad reducida: decodificación de intención direccional como canal alternativo de entrada en entornos de escritorio o realidad mixta, siempre que se demuestre robustez cross-sujeto.
- Investigación en paradigmas de imaginería motora o selección guiada: uso del modelo como línea base reproducible en estudios de decodificación direccional, con divisiones intra-sujeto y cross-sujeto documentadas.
- Evaluación de pipelines EEG de bajo coste: comparación de cabezales y configuraciones de electrodos mediante el rendimiento de decodificación en las mismas clases direccionales.
- Prototipado de interfaces cerebro-ordenador en juegos y experiencias espaciales: integración en demos de navegación dentro de motores XR, condicionada a la publicación de pesos y SDK.
- Estudio de calibración y deriva de señal: análisis de cuánto decae la precisión con el tiempo de sesión y qué recalibración es necesaria, usando las métricas de fallo que el autor prevé publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que «actualmente no se reportan cifras de rendimiento» y que el benchmark, las condiciones de evaluación y las limitaciones se publicarán en una actualización futura.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos ni arquitectura publicados).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el modelo no es un LLM de texto y no hay artefactos de inferencia publicados.
- Latencia y throughput estimados: no disponible; la model card menciona que se reportarán latencia de respuesta online y tasa de falsos disparos, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MindSoul Direction | Decodificacion EEG de direccion | no disponible | no disponible | sin cifras publicadas | solo investigacion personal no comercial | anuncio, sin pesos |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se han identificado alternativas concretas con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El repositorio no contiene pesos, código de entrenamiento ni ejemplos de inferencia; no es utilizable en producción ni en investigación en su estado actual.
- No existen resultados de benchmarks, por lo que no se puede verificar ninguna afirmación de rendimiento.
- No se especifican sesgos conocidos; en EEG, los sesgos por sujeto, dispositivo y protocolo de colocación de electrodos son un riesgo estructural, pero el autor no aporta datos al respecto.
- Riesgo de alucinación no aplicable en el sentido de LLM, pero sí riesgo de falsos positivos en la decodificación (falsos disparos), sin tasa publicada.
- Limitaciones de contexto e idioma: no se documentan; los idiomas declarados (zh, en) se refieren al ámbito del proyecto, no a capacidades del modelo.
- Licencia mindsoul-personal-research: solo permite investigación personal no comercial; cualquier uso comercial requiere autorización expresa del equipo.
- La model card advierte que el contenido de investigación no está destinado a diagnóstico ni tratamiento médico.
- La fecha de creación del repositorio (2026-10-31) y la naturaleza de anuncio implican que el contenido puede cambiar sustancialmente; conviene verificar la versión antes de citar.
- Las integraciones con Android XR, visionOS, PICO OS 6 y PC son direcciones previstas, no integraciones verificadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mindsoulBCI/mindsoul-direction
- GitHub del proyecto: https://github.com/pm-kevin-zhang/MindSoul
- GitHub de aplicaciones espaciales y materiales: https://github.com/pm-kevin-zhang/MindSoul-Spatial
- Sitio del proyecto: https://MindSoul.cn
- Licencia: archivo LICENSE en el repositorio de HuggingFace
