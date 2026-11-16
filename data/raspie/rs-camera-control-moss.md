# raspie/RS-CAMERA-CONTROL-MOSS

## Resumen

RS-CAMERA-CONTROL-MOSS es un adaptador LoRA experimental para el modelo de generación de imágenes MOSS-Image-SFT, desarrollado por el usuario raspie. Su función es añadir control explícito de cámara: dado un prompt, el adaptador permite seleccionar entre 42 vistas de cámara predefinidas y entrenadas, aplicando la dirección y un token aprendido específico para condicionar la generación. Se distribuye como un par de ficheros safetensors (el LoRA y un fichero de embeddings de cámara) que se cargan mediante un nodo personalizado de ComfyUI.

El modelo base, MOSS-Image-SFT, pertenece al equipo OpenMOSS y se distribuye bajo licencia Apache 2.0. El adaptador hereda esa licencia. La release corresponde a la época 5 del entrenamiento y al paso 4.740, con las imágenes y leyendas de entrenamiento no publicadas. El repositorio tiene un tamaño de 0,0 GB en el momento de la consulta y no registra descargas ni interacciones.

Se trata de un artefacto muy específico y de nicho: no es un modelo generativo autónomo, sino un complemento que requiere el modelo base y un entorno ComfyUI con el nodo RS MultiCharacter Sampler. Su relevancia es limitada fuera de flujos de trabajo de generación de imágenes con control de cámara, y su validación se restringe a un test de 16 vistas sobre escenas fijas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión MOSS-Image-SFT; incluye embeddings de cámara aprendidos |
| Parametros totales | no disponible (el LoRA y los tokens no publican recuento de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantización depende del modelo base y del runtime) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA y fichero de tokens de cámara) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre MOSS-Image-SFT, un modelo de difusión para text-to-image. Junto al LoRA se entrenaron embeddings de cámara: un fichero de tokens que contiene 42 vectores aprendidos de 4.096 dimensiones cada uno, correspondientes a 42 vistas de cámara. El nodo de ComfyUI selecciona la vista entrenada más cercana a la solicitada y aplica el LoRA, una leyenda de dirección y el token aprendido correspondiente al condicionamiento positivo.

La release publicada corresponde a la época 5 y al paso 4.740 del entrenamiento. No se han publicado las imágenes ni las leyendas de entrenamiento, ni el número de tokens o la composición del dataset. Tampoco se documenta si hubo etapas de RLHF, DPO u otras técnicas de alineación, algo poco habitual en adaptadores de difusión. La innovación principal es el uso de tokens de cámara aprendidos que se inyectan en el condicionamiento, en lugar de depender solo de descripciones textuales de la dirección.

## Capacidades

- Control de cámara en generación text-to-image: selección entre 42 vistas entrenadas, con aplicación automática de la dirección y el token correspondiente.
- Integración con ComfyUI mediante el nodo RS Camera Control del paquete RS MultiCharacter Sampler.
- Carga automática de los dos ficheros (LoRA y tokens) cuando el nodo reconoce el modelo MOSS-Image.
- Selección automática de la vista entrenada más cercana a la solicitada por el usuario.
- Compatibilidad con el modelo base MOSS-Image-SFT y su pipeline text-to-image.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Generación de imágenes con ángulos de cámara controlados: el adaptador permite fijar una vista concreta de las 42 entrenadas, útil para ilustración, storyboards y previsualización de escenas donde la dirección de cámara es un requisito.
- Consistencia de punto de vista en series de imágenes: al reutilizar el mismo token de cámara entre generaciones, se facilita mantener un ángulo coherente en una secuencia de ilustraciones o viñetas.
- Integración en flujos ComfyUI existentes: el nodo RS Camera Control se conecta entre el modelo MOSS-Image y el sampler, por lo que puede añadirse a pipelines ya montados sin reescribir el grafo.
- Prototipado de composición fotográfica: útil para explorar encuadres antes de una sesión real o para generar referencias de iluminación y perspectiva.
- Experimentación en investigación sobre control de cámara en difusión: el par LoRA + tokens aprendidos sirve como base para estudiar la inyección de condicionamiento geométrico en modelos text-to-image.
- Generación de material para entornos de diseño y arquitectura: vistas controladas de un mismo concepto para presentaciones o variaciones de producto, siempre que el resultado se valide manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es un test de 16 vistas sobre escenas fijas con resolución 768 × 1152, sampler Euler ancestral CFG++, SGM Uniform, 20 pasos, CFG 3 y sin LoRA de aceleración. Las siete parejas especulares superaron la comprobación automática izquierda/derecha, y tres parejas cumplieron además el criterio de ángulo más estricto. El propio autor señala que las escenas y semillas fijas limitan el alcance de este resultado.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador por separado; depende del modelo base MOSS-Image-SFT y del runtime de difusión empleado.
- GPU recomendadas: no disponibles de forma específica; al tratarse de un LoRA sobre un modelo de difusión, se aplican los requisitos del modelo base.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del modelo base y de la cuantización aplicada.
- Opciones de despliegue: ComfyUI con el nodo RS Camera Control del paquete RS MultiCharacter Sampler; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| RS-CAMERA-CONTROL-MOSS | LoRA + tokens de cámara sobre MOSS-Image-SFT | no disponible | no aplica | Apache 2.0 | 42 vistas, integración ComfyUI |
| RS-CAMERA-CONTROL-v2 | Adaptador de cámara para el modelo Anima | no disponible | no aplica | no disponible | Mismo autor; pensado para Anima, no para MOSS |
| MOSS-Image-SFT | Modelo base text-to-image | no disponible | no aplica | Apache 2.0 | Sin control de cámara explícito documentado |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador experimental, no un modelo autónomo: requiere MOSS-Image-SFT y el nodo de ComfyUI para funcionar.
- Solo cubre 42 vistas entrenadas; la selección se hace por proximidad a la vista más cercana, lo que puede introducir desviaciones respecto al ángulo solicitado.
- La validación se limita a 16 vistas sobre escenas fijas y semillas fijas; no hay evidencia de generalización a escenas abiertas.
- Las imágenes y leyendas de entrenamiento son privadas, lo que impide auditar sesgos o composición del dataset.
- El repositorio no registra descargas ni interacciones, y su tamaño es de 0,0 GB en la consulta, lo que puede indicar una publicación reciente o incompleta.
- No se documentan idiomas soportados ni comportamiento multilingüe.
- Riesgo de alucinación y de artefactos propio de los modelos de difusión: la fidelidad al prompt y a la vista solicitada debe validarse manualmente en producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y las dependencias de ComfyUI tienen sus propias condiciones que deben revisarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raspie/RS-CAMERA-CONTROL-MOSS
- Fichero LoRA: https://huggingface.co/raspie/RS-CAMERA-CONTROL-MOSS/resolve/main/RS-CAMERA-CONTROL-MOSS.safetensors
- Fichero de tokens de cámara: https://huggingface.co/raspie/RS-CAMERA-CONTROL-MOSS/resolve/main/RS-CAMERA-CONTROL-MOSS-tokens.safetensors
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio del nodo ComfyUI: https://github.com/raspie10032/ComfyUI_RS_MultiCharacter_Sampler
- Adaptador para Anima: https://huggingface.co/raspie/RS-CAMERA-CONTROL
