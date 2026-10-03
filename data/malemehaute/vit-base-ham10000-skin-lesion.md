# malemehaute/vit-base-ham10000-skin-lesion

## Resumen

vit-base-ham10000-skin-lesion es un modelo de clasificacion de imagenes desarrollado por el usuario malemehaute, consistente en un Vision Transformer (ViT) de tamano base, implementado a traves de la libreria timm y ajustado de forma fina (fine-tuning) sobre el conjunto de datos dermatologico HAM10000. El modelo resuelve una tarea de clasificacion multiclase en siete categorias diagnosticas de lesiones cutaneas, un problema clasico en el ambito del analisis de imagenes medicas. Se trata del proyecto final de la iniciativa MIA-ViT (FIUBA), con lo que su orientacion es fundamentalmente academica y de investigacion.

El repositorio ocupa 0,3 GB y no registra descargas ni interacciones en el momento de la consulta, por lo que se trata de una publicacion reciente o de baja difusion. La unica informacion cuantitativa publicada por el autor son dos metricas de test interno: un F1 macro de 0,692 y un recall macro sobre clases malignas de 0,724. El autor menciona evaluaciones fuera de dominio en PAD-UFES-20 y Fitzpatrick17k, asi como una comparacion frente a un baseline CLIP en modo zero-shot, pero no aporta cifras de dichos experimentos en la model card.

Su relevancia actual reside en que ejemplifica el uso de arquitecturas transformer de vision, preentrenadas de forma generica, adaptadas a dominios medicos especializados con recursos limitados. Al estar publicado bajo licencia MIT, es reutilizable sin restricciones de uso comercial, aunque sus resultados distan de los niveles requeridos para aplicaciones clinicas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) de tamano base, via timm |
| Parametros totales | no disponible (por convencion de ViT-Base, aproximadamente 86 millones, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (tarea de vision; el modelo no procesa texto de forma nativa) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 0,3 GB, formato no especificado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Vision Transformer en su variante base, tal y como se desprende del identificador y de la referencia a timm en la model card. Un ViT divide la imagen de entrada en parches, los proyecta como una secuencia de tokens y los procesa mediante bloques de atencion multi-cabeza, sustituyendo las convoluciones tradicionales por autoatencion global. El autor indica que se parte de un modelo preentrenado gestionado por la libreria timm y que se realiza un ajuste fino supervisado sobre HAM10000 para una cabeza de clasificacion de siete clases.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de HAM10000, la resolucion de entrada, la estrategia de aumentacion de datos ni si se aplicaron tecnicas de ajuste adicionales como RLHF o DPO (habitualmente no aplicables a clasificacion de imagenes). El autor menciona una evaluacion fuera de dominio sobre PAD-UFES-20 y Fitzpatrick17k y una comparacion con un baseline CLIP zero-shot, lo que sugiere un interes en medir generalizacion y sesgo de dominio, pero no se detallan ni los hiperparametros ni los resultados numericos de esos experimentos.

## Capacidades

- Clasificacion de imagenes dermatologicas en siete clases diagnosticas de HAM10000 (queratosis actinica, carcinoma basocelular, queratosis benigna, dermatofibroma, melanoma, nevus melanocitico y lesion vascular).
- Extraccion de caracteristicas visuales propias de un ViT preentrenado, reutilizable potencialmente para tareas derivadas mediante ajuste fino.
- Salida de probabilidades por clase, apta para umbrales de decision ajustables.
- Generacion de texto: no disponible, el modelo no es generativo ni multimodal.
- Tool calling o function calling: no disponible, no soportado.
- Soporte de agentes o razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no aplicables.

## Casos de uso

- Investigacion academica en dermatologia computacional: el modelo sirve como punto de partida reproducible para comparar tecnicas de ajuste fino sobre HAM10000, dado que el autor publica las metricas de F1 macro y recall de clases malignas.
- Prototipado de sistemas de triaje no diagnostico: podria integrarse en una demo que priorice imagenes con alta probabilidad de melanoma para revision humana, dejando siempre la decision final en manos de un especialista.
- Estudio de generalizacion entre dominios: al haberse evaluado sobre PAD-UFES-20 y Fitzpatrick17k, es util para analizar como se degrada un ViT entrenado en un dataset cuando cambia la distribucion de imagenes o el fototipo de piel.
- Baseline para comparativas de zero-shot: la comparacion con CLIP publicada por el autor permite usar este modelo como referencia supervisada frente a enfoques sin entrenamiento especifico.
- Docencia en vision por computador: adecuado como ejemplo practico de fine-tuning de un transformer de vision con un dataset medico pequeno y desbalanceado.
- Exploracion de tecnicas de aumento de datos y ponderacion de clases: la baja frecuencia de ciertas clases en HAM10000 lo convierte en un banco de pruebas para estrategias de mitigacion del desbalance.
- Integracion en pipelines de investigacion con transferencia a otras modalidades de imagen medica, aprovechando los pesos preentrenados como inicializacion.

## Benchmarks y rendimiento

| Metrica | Conjunto | Valor |
|---|---|---|
| F1 macro | Test interno HAM10000 | 0,692 |
| Recall macro (clases malignas) | Test interno HAM10000 | 0,724 |
| Evaluacion fuera de dominio | PAD-UFES-20 y Fitzpatrick17k | no disponible (mencionada sin cifras) |
| Comparacion con baseline CLIP zero-shot | no especificado | no disponible (mencionada sin cifras) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp16 para un ViT-Base de aproximadamente 86 millones de parametros; en torno a 1,5-2 GB si se incluyen activaciones con lotes moderados y entrada a 224x224 pixeles. Dato estimado a partir de la arquitectura, no confirmado por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria, incluidas NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100. El modelo no requiere aceleradores de gama alta.
- Compatibilidad con GPU de consumo: si, cabe sin dificultad en practicamente cualquier GPU de consumo actual e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers con la libreria timm, exportacion a ONNX, TorchScript o TensorRT. No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Para un ViT-Base en una GPU moderna se espera un throughput del orden de centenares o miles de imagenes por segundo, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento de otros modelos de clasificacion de lesiones cutaneas en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa rigurosa. Como referencia cualitativa, el propio autor menciona un baseline CLIP en modo zero-shot, pero sin cifras asociadas. Cualquier tabla comparativa con alternativas como otros ajustes finos de ViT, EfficientNet o ResNet sobre HAM10000 requeriria consultar las publicaciones originales correspondientes, que no forman parte de los datos facilitados.

## Limitaciones y advertencias

- No es un dispositivo medico ni ha sido validado clinicamente; su uso en diagnostico real no esta respaldado por los datos publicados.
- El F1 macro de 0,692 en test interno indica un rendimiento moderado, insuficiente para aplicaciones clinicas sin supervision humana.
- El entrenamiento sobre HAM10000 puede introducir sesgos de fototipo, ya que ese conjunto no representa de forma equilibrada todas las poblaciones; el propio autor evalua fuera de dominio en Fitzpatrick17k, lo que sugiere conciencia de esta limitacion, aunque sin publicar resultados.
- El conjunto HAM10000 presenta un fuerte desbalance de clases, con predominio de nevus melanociticos y baja frecuencia de dermatofibroma y lesiones vasculares; esto puede degradar el recall en clases minoritarias.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en imagenes fuera de la distribucion de entrenamiento.
- No se documentan los formatos de pesos, la resolucion de entrada ni los hiperparametros de entrenamiento, lo que dificulta la reproducibilidad exacta.
- La licencia MIT permite uso comercial, pero no exime de cumplir la normativa aplicable a datos de salud ni de obtener las autorizaciones pertinentes para tratar imagenes medicas.
- El repositorio no registra descargas ni validacion por parte de la comunidad, por lo que su calidad no ha sido contrastada de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malemehaute/vit-base-ham10000-skin-lesion
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos asociados al modelo.
