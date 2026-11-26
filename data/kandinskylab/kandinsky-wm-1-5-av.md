# kandinskylab/Kandinsky-WM-1.5-AV

## Resumen

Kandinsky WM 1.5 AV es un modelo generativo de vídeo especializado en la síntesis de escenas de conducción autónoma. Lo desarrolla el equipo kandinskylab (vinculado a Sberbank, según la referencia al artículo de Habr sobre WM 1.0) y se distribuye a través de Hugging Face con la librería diffusers. El modelo parte de una imagen, un texto y, opcionalmente, una trayectoria de cámara, y genera secuencias de vídeo coherentes con la escena de conducción. Resuelve el problema de la generación de datos sintéticos y de la simulación controlable de entornos viales, un ámbito donde los modelos de vídeo generalistas no ofrecen control explícito sobre la cámara ni sobre la continuidad temporal de la escena.

El repositorio no contiene un único modelo, sino cuatro bundles autocontenidos con pesos nativos para distintos regímenes de inferencia: Base AV (27,3 GB), UCPE (25,7 GB), AR (34,0 GB) y F2LF (25,7 GB). Cada bundle incluye el modelo, el acondicionamiento de texto y los componentes de vídeo. El tamaño total del repositorio es de 77,5 GB en formato safetensors.

La relevancia actual del modelo radica en su enfoque como world model para conducción autónoma: no se limita a generar vídeo plausible, sino que incorpora control de trayectoria de cámara (UCPE), generación autorregresiva por fragmentos con memoria de escena (AR) e interpolación entre imágenes de referencia calibradas (F2LF). La información disponible no detalla la arquitectura interna ni el número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para generacion de video, segun la libreria diffusers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin indicacion de variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 77,5 GB (Base AV 27,3 GB, UCPE 25,7 GB, AR 34,0 GB, F2LF 25,7 GB) |
| Libreria | diffusers |
| Pipeline | image-to-video |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo: no se detalla si emplea un transformer de difusion, un modelo latente de video o una combinacion con modulos de control de camara. La model card unicamente describe la organizacion en cuatro bundles de inferencia nativa, cada uno orientado a un modo de generacion distinto: Base AV (generacion desde una imagen, continuacion de un prefijo de video o prompts temporizados), UCPE (generacion siguiendo una trayectoria de camara suministrada), AR (generacion autorregresiva de fragmentos sucesivos con historial de escena) y F2LF (generacion entre una primera y una ultima imagen de referencia calibradas).

Tampoco se proporcionan datos sobre el volumen de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Lo que si se documenta es el mecanismo de distribucion: cada bundle es autocontenido e incluye modelo, acondicionamiento de texto y componentes de video, y los pesos se descargan mediante la utilidad `kwm-av` con verificacion de hashes SHA-256 sobre la revision `4d0011bb8650201985e51d39b2a1d75240ab37b5`.

## Capacidades

- Generacion de video image-to-video: sintetiza secuencias de video a partir de una imagen de entrada en el dominio de conduccion autonoma.
- Continuacion de video: el bundle Base AV permite continuar un prefijo de video existente.
- Prompts temporizados: Base AV admite indicaciones de texto asociadas a intervalos temporales concretos.
- Control de camara: el bundle UCPE genera siguiendo una trayectoria de camara suministrada explicitamente.
- Generacion autorregresiva: el bundle AR produce fragmentos sucesivos conservando el historial de la escena, lo que permite secuencias mas largas.
- Interpolacion entre referencias: el bundle F2LF genera el video intermedio entre una primera y una ultima imagen calibradas.
- Acondicionamiento de texto: los bundles incorporan componentes de texto para condicionar la generacion.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni soporte multilingue explicito.

## Casos de uso

- Generacion de datos sinteticos para entrenamiento de percepcion: el modelo produce escenas de conduccion controlables a partir de imagenes reales, lo que permite ampliar datasets con variaciones de trayectoria y condicionamiento textual sin coste de captura.
- Simulacion de trayectorias de camara para validacion de planificadores: con el bundle UCPE se generan videos siguiendo una trayectoria dada, utiles para comprobar como responderia un sistema de percepcion ante maniobras concretas.
- Extension de clips cortos de conduccion: el bundle AR, al generar fragmentos sucesivos con memoria de escena, permite alargar secuencias existentes manteniendo coherencia temporal.
- Interpolacion de fotogramas clave calibrados: el bundle F2LF genera el tramo intermedio entre dos imagenes de referencia, util para reconstruir secuencias a partir de capturas dispersas o para aumentar la tasa de fotogramas efectiva.
- Prototipado de escenarios contrafactuales: partiendo de una imagen de calzada, el modelo puede generar variantes de la escena condicionadas por texto para estudiar respuestas del sistema ante situaciones no presentes en el dataset original.
- Demostraciones y material divulgativo: la generacion image-to-video con control de camara facilita producir visualizaciones de escenarios de conduccion para presentaciones tecnicas o evaluacion cualitativa de modelos.
- Investigacion en world models: los cuatro modos de inferencia permiten comparar regimenes de generacion (continuacion, autorregresivo, controlado, interpolado) sobre una misma base, lo que resulta util para estudiar coherencia temporal y controlabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente remite a una pagina de comparaciones de referencia en GPU (`docs/reproducibility.md` del repositorio de GitHub), sin cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, los bundles pesan entre 25,7 GB y 34,0 GB en safetensors, por lo que la inferencia en precision nativa requiere previsiblemente GPUs con al menos 40-80 GB de memoria, aunque el dato exacto no esta documentado.
- GPU recomendadas: no disponible. El repositorio de GitHub incluye una pagina de comparaciones de referencia en GPU, pero no se detallan los modelos concretos en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible. El tamano de los bundles (25,7-34,0 GB) hace improbable que quepan en GPUs de consumo de 24 GB en precision nativa, pero no se confirma ni se documentan variantes cuantizadas.
- Opciones de despliegue: la libreria declarada es diffusers; la descarga e integridad de pesos se gestiona con la utilidad `kwm-av` del repositorio de GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este modelo de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones internas (parametros, contexto) de este modelo, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. La informacion proporcionada no incluye modelos comparables ni cifras que permitan contrastarlos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia antes de cualquier despliegue en produccion.
- Idiomas no disponibles: no se documenta el soporte multilingue del acondicionamiento de texto.
- Arquitectura y parametros no documentados: la ausencia de estas especificaciones dificulta la planificacion de recursos y la evaluacion tecnica.
- Dominio restringido: el modelo esta especializado en escenas de conduccion autonoma; su comportamiento fuera de ese dominio no esta documentado.
- Riesgo de alucinacion visual: como modelo generativo de video, puede producir elementos fisicamente inconsistentes o no presentes en la escena de entrada; no se documentan metricas de fidelidad.
- Repositorio con cero descargas y un unico like en el momento de la consulta: ecosistema de validacion practicamente inexistente, lo que reduce la confianza en su robustez en produccion.
- Dependencia de la utilidad `kwm-av` y de una revision concreta de pesos: el flujo de descarga e inferencia esta atado al repositorio de GitHub del equipo, lo que anade un punto de fallo externo.
- Sin variantes cuantizadas documentadas: el despliegue en hardware limitado no esta cubierto por la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/kandinskylab/Kandinsky-WM-1.5-AV
- Revision de pesos verificada: https://huggingface.co/kandinskylab/Kandinsky-WM-1.5-AV/commit/4d0011bb8650201985e51d39b2a1d75240ab37b5
- Coleccion en Hugging Face: https://huggingface.co/collections/kandinskylab/kandinsky-wm-15-6b0420ff37178b56f3ae1f14
- Codigo y ejemplos (GitHub): https://github.com/kwm-team/kandinsky-wm-1.5
- Quickstarts de inferencia y galeria: https://github.com/kwm-team/kandinsky-wm-1.5#readme
- Formato de manifiesto de pesos: https://github.com/kwm-team/kandinsky-wm-1.5/blob/main/docs/weights.md
- Comparaciones de referencia en GPU: https://github.com/kwm-team/kandinsky-wm-1.5/blob/main/docs/reproducibility.md
- Kandinsky WM 1.0 (GitHub): https://github.com/kandinskylab/kandinsky-wm
- Articulo sobre WM 1.0 (Habr): https://habr.com/ru/companies/sberbank/articles/1054966/
