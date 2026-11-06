# dongjintao/GUI-Swift-4B

## Resumen

GUI-Swift-4B es un adaptador de investigación publicado por el usuario dongjintao sobre el backbone vision-language mPLUG/GUI-Owl-1.5-4B-Instruct. Su tesis central es la predicción de acciones de interfaz gráfica de escritorio en un único forward causal: en lugar de generar texto autorregresivamente token a token, el modelo rellena 131 slots de valor fijos (acción, coordenadas, teclas, scroll, tiempo, estado y texto) en una sola pasada sobre el vocabulario nativo del backbone congelado. El resultado es un checkpoint especializado en computer-use que emite una acción canónica completa con parámetros y texto asociado.

La relevancia técnica está en la eficiencia de decodificación: elimina la escritura autorregresiva separada para la predicción de acción y reutiliza el head de vocabulario original sin añadir un generador de texto independiente. La representación de coordenadas adopta el esquema de 256 bins por eje (codebook tipo E-arm) inspirado en GUI-Decisions, con el mismo codebook para coordenadas históricas y predichas. El adaptador se monta sobre el submódulo del modelo de lenguaje, no sobre el VLM completo, y requiere un entry point de inferencia propio.

Se trata de la primera release, correspondiente al paso de SFT Desktop131 step3368, exclusivamente para escritorio: no es Unified133, no está entrenado para móvil y no es un checkpoint de RL. El autor advierte explícitamente de que el nombre describe el enfoque de ejecución previsto y que esta release no establece una ventaja medida de éxito de tarea ni de latencia frente al modelo base. El repositorio ocupa 0,1 GB, lo que confirma que se distribuye solo el adaptador y no los pesos completos del backbone.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (backbone GUI-Owl-1.5-4B-Instruct) con adaptador LoRA sobre el submodulo del modelo de lenguaje; prediccion de accion en un unico forward sobre 131 slots fijos |
| Parametros totales | No disponible (el backbone ronda los 4B por el nombre del modelo base; el adaptador LoRA suma 33.030.144 parametros FP32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el backbone se descarga en BF16, aproximadamente 8,9 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 para el codigo y adaptador propios del proyecto; la dependencia externa GUI-Decisions no se relicencia y se obtiene del repositorio del autor |
| Formato de pesos | safetensors (adaptador LoRA); backbone base en formato original de transformers |

## Arquitectura y entrenamiento

El modelo parte del VLM GUI-Owl-1.5-4B-Instruct, cuyo encoder de visión y mergers permanecen congelados, igual que los embeddings de entrada, el head de salida atado original y los parámetros base en BF16. Sobre el submodelo de lenguaje se aplica un LoRA de rango 16, alpha 32 y dropout 0,05 que cubre 252 módulos lineales de atención y MLP, con proyecciones adaptadas en q, k, v, o, gate, up y down. La innovación principal es el protocolo de acción: 131 slots fijos distribuidos en acción (3), x e y (1 cada uno), teclas (16), cantidad de scroll (4), tiempo (5), estado (1) y texto (100). Las coordenadas se decodifican como enteros normalizados en 0..1000 mediante el readout `local2` y un codebook de 256 bins por eje, compartido entre coordenadas históricas y predichas.

El entrenamiento combina un piloto de 64 actualizaciones sobre 512 ejemplos con una continuación de 3.368 actualizaciones sobre los 26.944 ejemplos restantes, visitando una vez el split de entrenamiento de 27.456 ejemplos. La función de pérdida es entropía cruzada sobre los campos de acción más el doble de la media de las pérdidas de los campos de parámetros activos, con normalización sobre el vocabulario completo; las coordenadas usan objetivos de sigma fija 0,005. Se empleó tasa de aprendizaje 2e-4 y batch global efectivo de 8. El split de validación guardado tiene 1.967 filas y se usó repetidamente durante el desarrollo. El autor subraya que esta no es la configuración posterior prevista de rango 256 all-linear, ni el objetivo Unified133 con media por token, ni un esquema adaptativo de cajas.

## Capacidades

- Predicción de acciones de GUI de escritorio en una sola pasada causal, con acción, parámetros y texto en la misma salida.
- Decodificación restringida por catálogo de acciones y teclas, preservando el comportamiento original ante salidas inválidas.
- Coordenadas normalizadas en 0..1000 con representación de 256 bins por eje.
- Soporte de historial: conserva todas las acciones históricas aportadas y las dos últimas capturas de pantalla del historial.
- Entrada multimodal: instrucción en lenguaje natural más captura de pantalla, con rutas de imagen relativas al fichero de petición.
- Acciones cubiertas por el protocolo: clic con coordenadas, teclado (16 slots), scroll (4 slots), tiempo (5 slots) y estado (1 slot), más texto libre limitado a 99 tokens nativos más EOS.
- No soporta tool calling genérico ni function calling: el runtime no expone acciones de shell arbitrarias.
- No dispone de un escritor de texto autorregresivo separado en esta release.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Automatización de pruebas de regresión de UI de escritorio: el modelo recibe la instrucción y la captura y devuelve una acción canónica con coordenadas y parámetros, que un runner puede ejecutar y validar contra el estado esperado de la aplicación.
- Asistencia a operadores en tareas repetitivas de escritorio: dada una instrucción como rellenar un formulario, el modelo emite la secuencia de clics y entradas de teclado con coordenadas normalizadas, útil para prototipos de agentes de computer-use en entorno controlado.
- Generación de trayectorias sintéticas para entrenamiento de agentes: el protocolo de 131 slots y el historial de acciones permiten producir datos etiquetados de acción a partir de capturas, reutilizables en pipelines de imitación.
- Investigación en decodificación eficiente: al predecir la acción completa en un único forward sobre slots fijos, sirve como banco de pruebas para comparar latencia y precisión frente a esquemas autorregresivos de predicción de acciones.
- Integración en herramientas de accesibilidad: un sistema externo puede traducir instrucciones en lenguaje natural a acciones de puntero y teclado concretas, con el modelo como planificador de bajo nivel que no controla directamente el ratón ni el teclado.
- Evaluación de representaciones de coordenadas: el uso del codebook de 256 bins compartido entre histórico y predicción permite estudiar el efecto de la cuantización de coordenadas en la precisión de localización de elementos de UI.
- Prototipado de agentes de escritorio con memoria corta: el soporte de historial con las dos últimas capturas y todas las acciones previas facilita tareas multi-paso donde el contexto visual inmediato es suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el ejemplo incluido es una entrada sintética de humo de UI, no un resultado de benchmark ni un éxito de tarea en aplicación real, y que esta release no establece una ventaja medida de éxito de tarea o latencia frente al modelo base.

## Requisitos de hardware

- GPU NVIDIA obligatoria según las instrucciones de inicio rápido; se requiere Python 3.10 o superior.
- El backbone base se descarga con aproximadamente 8,9 GB, lo que en BF16 exige del orden de 9 a 10 GB de VRAM solo para los pesos, más overhead de activaciones y del encoder de visión.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una RTX 4090 (24 GB) o una A100/H100 son opciones razonables, pero el autor no publica cifras de VRAM ni de latencia.
- No se confirma que quepa en GPUs de consumo con menos de 12 GB; no hay datos de cuantización del adaptador ni del backbone en la información disponible.
- Despliegue mediante el entry point propio `infer.py`, con preparación de dependencias vía `prepare_dependencies.py` y verificación por hash de cada fichero base y fuente upstream.
- No es compatible con `generate()` estándar ni con cargar el adaptador en el VLM completo mediante `PeftModel.from_pretrained` genérico; el adaptador se adjunta al submódulo del modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GUI-Swift-4B | Backbone ~4B + LoRA de 33M | No disponible | Prediccion de accion en un unico forward sobre 131 slots | Apache-2.0 (codigo y adaptador propios) | Hugging Face, requiere runtime propio y dependencia externa GUI-Decisions |
| mPLUG/GUI-Owl-1.5-4B-Instruct | ~4B | No disponible | VLM base para GUI, generacion autorregresiva | No disponible en la informacion proporcionada | Hugging Face |
| GUI-Decisions | No disponible | No disponible | Representacion de coordenadas en 256 bins y readout E-arm | Sin fichero de licencia en el snapshot upstream citado | Repositorio GitHub del autor |

La comparación con alternativas de la misma categoría (agentes GUI de escritorio de tamaño similar) no está disponible en la información proporcionada. El propio autor señala que no se ha establecido una ventaja medida frente al modelo base, por lo que la comparación de rendimiento queda abierta.

## Limitaciones y advertencias

- Checkpoint exclusivamente de escritorio: no es Unified133, no está entrenado para móvil y no es un checkpoint de RL.
- Solo inglés; no hay soporte multilingüe declarado.
- No hay escritor de texto autorregresivo separado: el texto se limita a 99 tokens nativos más EOS dentro de los slots.
- El drag tiene un único par de coordenadas de destino y parte del puntero actual; esta versión no codifica ambos extremos.
- La cantidad de scroll conserva la convención histórica de número de ruedas pese a que el campo se denomine `pixels`.
- El script de inferencia imprime una acción y no controla el ratón ni el teclado; cualquier ejecución real requiere un runner externo.
- El runtime no dispone de acción de shell arbitraria y mantiene el comportamiento original ante salidas inválidas.
- El split de validación se usó repetidamente durante el desarrollo, lo que puede inflar la estimación de generalización.
- La dependencia externa GUI-Decisions no tiene fichero de licencia en el snapshot seleccionado y no se incluye ni relicencia en el repositorio; los usuarios deben obtenerla del repositorio del autor, y la licencia Apache-2.0 no cubre esa dependencia.
- El adaptador no funciona con `generate()` estándar ni con carga genérica de PEFT sobre el VLM completo; usarlo mal produce resultados que no reproducen el protocolo.
- Riesgo de alucinación y de coordenadas imprecisas no cuantificado: no hay benchmarks publicados que permitan estimar la tasa de éxito en aplicaciones reales.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongjintao/GUI-Swift-4B
- Modelo base: https://huggingface.co/mPLUG/GUI-Owl-1.5-4B-Instruct
- GUI-Decisions (dependencia externa citada): https://github.com/infinitylogesh/GUI-Decisions
- GUI-Owl / Mobile-Agent (backbone preentrenado): https://github.com/X-PLUG/MobileAgent
