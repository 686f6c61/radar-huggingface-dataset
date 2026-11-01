# nomadoor/qwen-image-2.1-360-panorama-outpaint-lora

## Resumen

El modelo `nomadoor/qwen-image-2.1-360-panorama-outpaint-lora` es un adaptador LoRA de edicion de imagen disenado para el modelo base Qwen-Image-2.1 de Alibaba Qwen. Su proposito concreto es construir panoramas equirectangulares (ERP) de 360 grados completos a partir de fotografias colocadas sobre un lienzo 2:1: el usuario situa sus imagenes en el lienzo y rellena el resto con verde puro (`#00FF00`), y el LoRA rellena esas zonas verdes generando contenido coherente que conecta las fotos con el entorno y cierra la costura izquierda-derecha del panorama.

El adaptador resuelve un problema muy especifico dentro del flujo de trabajo de creacion de contenido inmersivo: convertir fotografias sueltas en panoramas navegables sin necesidad de costosas sesiones de captura 360. La innovacion respecto al modelo base no esta en la generacion de contenido nuevo (Qwen-Image-2.1 ya puede rellenar el verde), sino en la calidad del empalme en la costura horizontal del panorama, que segun el autor queda mas limpia con el LoRA activado.

Se trata de un adaptador de bajo rango (rank 32, alpha 32) de aproximadamente 0,2 GB, entrenado con AI-Toolkit sobre 3.452 pares entrada-objetivo derivados de 1.151 panoramas ERP de dominio publico. La version publicada es v0.1, un checkpoint intermedio de una unica ejecucion de entrenamiento, y hereda la licencia Qwen Research del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen-Image-2.1 |
| Parametros totales | no disponible (el LoRA tiene rank 32 / alpha 32; el modelo base no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones que soporte diffusers) |
| Idiomas soportados | no disponibles (los prompts de entrenamiento estan en ingles) |
| Licencia | Qwen Research License Agreement (heredada del modelo base) |
| Formato de pesos | safetensors (`qwen_image_2_1_360_panorama_outpaint_lora_v0_1.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre Qwen-Image-2.1, un modelo de difusion para generacion y edicion de imagenes del que no se detallan en la informacion disponible ni el tamano de parametros ni la arquitectura interna concreta. El adaptador en si es un LoRA de rank 32 y alpha 32, entrenado con AI-Toolkit (configuracion `qwen_image_2`), con tasa de aprendizaje 1e-4, batch de 4, optimizador AdamW8bit y embeddings de texto cacheados. El entrenamiento se ejecuto durante 1.500 pasos, aproximadamente 1,7 epocas, a resoluciones de 1088x544 y 1408x704.

El conjunto de datos consta de 3.452 pares de entrada y objetivo construidos a partir de 1.151 panoramas ERP de colecciones publicas como Poly Haven, ESO y Wikimedia Commons, con preferencia por escenas complejas (interiores, calles, edificios, personas). Para cada panorama se generaron entre 2 y 4 pares: se recortan de 1 a 3 fotos como vistas pinhole y se recolocan sobre un lienzo verde usando el mismo codigo de proyeccion que el nodo Panorama Studio. En la mayoria de los pares se desplazan ligeramente la posicion, el roll y el campo de vision, y se alteran un poco los colores, de modo que el modelo aprende a absorber una colocacion aproximada. Cada par se rota horizontalmente de forma aleatoria y uno por panorama coloca una foto a caballo entre el borde izquierdo y el derecho. Todos los pares comienzan con la frase disparadora y alrededor del 70 % continuan con una instruccion detallada sobre lo que debe rellenar el verde.

## Capacidades

- Relleno de zonas verdes (`#00FF00`) en un lienzo equirectangular 2:1 para completar un panorama de 360 grados.
- Integracion de fotografias colocadas por el usuario, con ajuste ligero de color y perspectiva para que encajen en la escena circundante.
- Cierre de la costura horizontal izquierda-derecha del panorama, que es la mejora principal respecto al modelo base.
- Generacion de contenido nuevo coherente con la escena descrita en el prompt (entorno, direccion de la luz, materiales, continuidad del suelo).
- Control del contenido generado mediante instrucciones textuales detalladas que acompanan a la frase disparadora.
- Trabajo sobre una colocacion aproximada de las fotos: el modelo absorbe pequenos desajustes de posicion, roll, campo de vision y color.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador de generacion de imagen, no un modelo de lenguaje.
- Capacidades multilingues: no disponibles; los prompts de entrenamiento estan en ingles.

## Casos de uso

- Creacion de panoramas 360 para tours virtuales inmobiliarios: a partir de unas pocas fotos de las habitaciones colocadas sobre el lienzo ERP, el LoRA rellena paredes, techos y suelos y cierra la costura, generando un panorama navegable sin desplazamiento fisico.
- Produccion de entornos HDRI para iluminacion en render 3D: el panorama resultante puede usarse como mapa de entorno en motores como Blender o Unreal, con la ventaja de que la costura limpia evita artefactos de iluminacion en el punto de union.
- Ampliacion de material fotografico existente para experiencias de realidad virtual: fotos de un espacio escenico o de un evento se integran en un panorama completo que puede visualizarse en visores VR, reduciendo la necesidad de captura especifica en 360.
- Prototipado rapido de escenarios para videojuegos: disenadores que disponen de referencias fotograficas de un entorno pueden generar panoramas de fondo coherentes para niveles o menus, ajustando el contenido mediante prompts descriptivos.
- Documentacion y divulgacion de patrimonio: a partir de fotografias de detalle de un monumento o yacimiento, se construye un panorama del entorno que contextualiza las piezas, con control del estilo realista que domina el entrenamiento.
- Generacion de fondos panoramicos para publicidad y redes sociales: creacion de escenarios inmersivos de gran formato (2048x1024) donde encajar productos o figuras mediante edicion posterior, aprovechando la continuidad del empalme.
- Flujos de trabajo en ComfyUI con el nodo Panorama Studio: integracion directa en pipelines de nodos donde el usuario coloca las fotos, lanza el prompt disparador y obtiene el panorama listo para su uso o para una segunda pasada de edicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende enteramente del modelo base Qwen-Image-2.1, cuyos requisitos no se detallan; el adaptador LoRA en si ocupa aproximadamente 0,2 GB.
- GPU recomendadas: no disponibles. Al tratarse de un modelo de difusion para imagenes a resoluciones de 2048x1024, se requiere una GPU con VRAM suficiente para el modelo base completo, pero no se especifica cual.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card indica el uso mediante la libreria `diffusers` y, en la practica, a traves de ComfyUI con el nodo `Panorama Studio` del repositorio ComfyUI-Panorama-Stickers. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles. La configuracion de prueba indicada es 25 pasos, CFG 1 y salida de 2048x1024, con fuerza de LoRA 0,8.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nomadoor/qwen-image-2.1-360-panorama-outpaint-lora | LoRA de edicion de imagen sobre Qwen-Image-2.1 | rank 32 / alpha 32 (adaptador); base no disponible | no disponible | Qwen Research | HuggingFace, diffusers, ComfyUI |
| Qwen/Qwen-Image-2.1 (modelo base) | Modelo de difusion de imagen | no disponible | no disponible | Qwen Research | HuggingFace |
| Otros LoRA de panorama 360 para difusion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables adicionales en la informacion proporcionada. La unica comparacion documentada es cualitativa: frente al modelo base sin LoRA, el autor senala que la diferencia principal esta en la union mas limpia de los bordes izquierdo y derecho del panorama.

## Limitaciones y advertencias

- La version v0.1 es un checkpoint intermedio de una unica ejecucion de entrenamiento; la costura del panorama sigue rompiendose en algunas escenas.
- Las personas que aparecen en las fotos colocadas pueden salir estiradas o distorsionadas.
- Las instantaneas ordinarias son mas dificiles de integrar que las fotos recortadas de panoramas reales.
- Los datos de entrenamiento son casi exclusivamente paisajes realistas; no se han probado otros estilos (ilustracion, anime, estilizado), por lo que el comportamiento fuera de ese dominio es incierto.
- El entrenamiento se realizo con prompts en ingles; el comportamiento con instrucciones en castellano no esta documentado.
- La licencia Qwen Research heredada del modelo base puede imponer restricciones al uso comercial; debe revisarse el acuerdo completo antes de desplegar en produccion.
- No es un modelo de lenguaje: no soporta razonamiento, codigo, tool calling ni agentes, y no debe evaluarse con benchmarks de texto.
- Riesgo de alucinacion visual: el contenido generado en las zonas verdes puede no corresponder con la escena real circundante si el prompt no la describe con precision.
- El adaptador requiere el modelo base Qwen-Image-2.1 y no funciona de forma autonoma.

## Enlaces

- HuggingFace del LoRA: https://huggingface.co/nomadoor/qwen-image-2.1-360-panorama-outpaint-lora
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio ComfyUI-Panorama-Stickers (nodo Panorama Studio): https://github.com/nomadoor/ComfyUI-Panorama-Stickers
- Licencia Qwen Research License Agreement: https://huggingface.co/Qwen/Qwen-Image-2.1
