# Gabriel/diffu-moss-hand-overstathallarambetet-1715

## Resumen

diffu-moss-hand-overstathallarambetet-1715 es un adaptador LoRA para el modelo de difusión text-to-image MOSS-Image-Base, desarrollado por el usuario Gabriel en el marco del proyecto diffu (repositorio Borg93/diffu2). Su proposito concreto es generar paginas manuscritas sinteticas que imiten la mano caligrafica del Överståthållarämbetet sueco de 1715, es decir, la cancilleria de Estocolmo de principios del siglo XVIII. No es un modelo generativo de proposito general, sino una pieza dentro de un pipeline de aumento de datos para entrenar sistemas de reconocimiento de escritura manuscrita (HTR) y lectura de paginas de archivo.

El adaptador se aplica sobre el transformer DiT de MOSS-Image-Base y modifica 265 capas Linear mediante LoRA de rango 32 y alpha 32. El objetivo declarado es producir imagenes de paginas de archivo con etiquetas ALTO y PAGE exactas, de modo que el texto dibujado pueda usarse como ground truth supervisado en el entrenamiento de modelos de lectura. El adaptador esta entrenado unicamente con 160 ventanas de aproximadamente 1 megapixel procedentes de transcripciones reales de escritura archival sueca.

La relevancia del modelo es acotada y muy especializada: resuelve el cuello de botella de datos etiquetados en digitalizacion de archivos historicos, donde conseguir pares imagen-transcripcion es caro y lento. Su licencia Apache-2.0 y su formato PEFT lo hacen integrable en pipelines existentes de MOSS-Image. El modelo esta etiquetado con el idioma sueco y no declara capacidades multilingues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el transformer DiT de MOSS-Image-Base; 42 bloques conjuntos con q, k, v, o, ffn_up_gate y ffn_down |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no declara cifra en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; los pesos del adaptador se distribuyen en bfloat16 |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), configuracion PEFT en adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se inserta en el DiT de MOSS-Image-Base mediante LoRA de rango 32 y alpha 32 sobre 265 capas Linear. Cubre los 42 bloques conjuntos del DiT (q, k, v, o, ffn_up_gate, ffn_down), su refinador de texto, sus dos embedders y su capa final. Los nombres de modulo son los propios de MOSS-Image, de modo que el adaptador es aplicable a cualquier implementacion que los conserve; la implementacion de referencia es MossTransformer de diffu. El adaptador se fusiona con el DiT mediante PEFT (merge_and_unload) y se guarda como snapshot completo para dibujar con el como cualquier modelo MOSS-Image.

El entrenamiento se realizo con KohakuMossTrainer, un LoRA de LyCORIS con algoritmo lora, rango 32 y alpha 32, usando AdamW a 1e-4 durante 700 pasos. El conjunto de datos son 160 ventanas de aproximadamente 1 MP recortadas de paginas reales de escritura archival sueca, cada una con caption en formato MOSS Layout (coleccion nombrada, texto exacto de cada linea y su caja). El encoder de texto y el VAE permanecieron congelados y se uso el muestreo de niveles de ruido propio de MOSS-Image. La exportacion LyCORIS se convirtio al formato PEFT y se verifico capa por capa: cada clave cae en una capa que PEFT construye desde esta configuracion, sin claves faltantes ni sobrantes, y el escalado (alpha / r) x up @ down coincide exactamente con el entrenado.

## Capacidades

- Generacion de imagenes text-to-image de paginas manuscritas en la mano del Överståthållarämbetet de 1715.
- Dibujo de paginas de archivo con layout controlado mediante prompts de tipo MOSS Layout, que especifican la coleccion, el texto exacto de cada linea y su caja.
- Produccion de datos sinteticos etiquetados para entrenamiento de HTR y modelos de lectura de paginas.
- Integracion como adaptador PEFT fusionable en el DiT de MOSS-Image-Base.
- Generacion condicionada por caption de procedencia (titulo de coleccion y anos), que diffu construye a partir del campo style de cada trabajo de pagina.
- No declara soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No declara capacidades de vision, audio ni comprension de imagenes; es exclusivamente generativo.
- Cobertura linguistica limitada al sueco en el dominio de la escritura historica.

## Casos de uso

- Aumento de datos para HTR: generar cientos o miles de paginas sinteticas con etiquetas ALTO y PAGE exactas para entrenar o afinar modelos de reconocimiento de escritura manuscrita alli donde no hay transcripciones reales suficientes.
- Reconstruccion de series documentales incompletas: producir paginas plausibles de la coleccion Överståthållarämbetet 1715 para completar corpus de investigacion historica con material claramente marcado como sintetico.
- Evaluacion de robustez de lectores de paginas: usar las paginas generadas como conjunto de test controlado con ground truth conocido para medir la tasa de error de un modelo de lectura ante variaciones de layout y caligrafia.
- Entrenamiento de modelos de layout y segmentacion: las cajas de linea incluidas en el prompt permiten generar pares imagen-etiqueta para tareas de deteccion de regiones y lineas en documentos historicos.
- Prototipado de interfaces de archivo digital: generar vistas de pagina realistas para maquetar visores de documentos, herramientas de transcripcion asistida o demos de humanidades digitales sin depender de escaneos con derechos.
- Investigacion en paleografia computacional: estudiar como un modelo de difusion representa una mano caligrafica concreta y comparar la fidelidad de la sintesis frente a escaneos reales de la misma cancilleria.
- Docencia y divulgacion: ilustrar el aspecto de un registro de cancilleria sueco de 1715 en materiales formativos, con la ventaja de que la imagen es generada y no reproduce un documento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB en el repositorio; el coste real de inferencia lo determina el modelo base MOSS-Image-Base, cuyas necesidades de VRAM no se detallan en la informacion proporcionada.
- No se dispone de datos sobre GPU recomendadas, ajuste en GPUs de consumo ni latencia o throughput del adaptador.
- El autor especifica los parametros de muestreo recomendados: aproximadamente 1 MP de resolucion, 50 pasos, guidance 3, shift 5 y salto del bloque 22 en la pasada incondicional.
- Despliegue mediante PEFT: cargar MossTransformer desde el snapshot de MOSS-Image-Base, aplicar PeftModel.from_pretrained y fusionar con merge_and_unload; despues empaquetar con diffu-moss-init en un snapshot completo.
- Revision del modelo base fijada por el autor: OpenMOSS-Team/MOSS-Image-Base en el commit 85975793d8b3d432f1b6e27f352abaa4c2a4c0d3.
- No se mencionan opciones de despliegue como vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de difusion de imagen de este tipo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffu-moss-hand-overstathallarambetet-1715 | LoRA sobre DiT de difusion | no disponible | no aplica | Apache-2.0 | Hugging Face, 0 descargas |
| MOSS-Image-Base | DiT de difusion text-to-image | no disponible | no aplica | no disponible en la informacion | Hugging Face (OpenMOSS-Team) |
| Alternativas especializadas en HTR sintetico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de generacion de escritura historica sintetica que permita una comparacion cuantitativa. La unica referencia directa es el modelo base MOSS-Image-Base, del que este adaptador hereda arquitectura y licencia.

## Limitaciones y advertencias

- Una sola mano y una sola coleccion: otras caligrafias y otros tipos de pagina no han sido probados.
- El texto dibujado debe verificarse: diffu relee cada linea generada y marca como unclear en las etiquetas aquellas que no puede confirmar, lo que implica que una parte de la salida puede no ser util como ground truth.
- Riesgo de alucinacion en el contenido textual: al ser un modelo generativo, puede producir texto plausible pero inexistente en la fuente original; no debe presentarse como transcripcion real.
- Cobertura linguistica limitada al sueco y al dominio de la escritura de cancilleria de principios del siglo XVIII.
- El adaptador no incluye pagina de muestra: la mano procede del adaptador y del prompt, por lo que el resultado depende fuertemente de nombrar correctamente la coleccion en el caption.
- Dependencia estricta de la revision concreta del modelo base indicada por el autor; cambios en MOSS-Image-Base pueden romper la correspondencia de nombres de modulo.
- El entrenamiento se realizo con solo 160 ventanas y 700 pasos, lo que limita la variedad de layouts y estilos que el adaptador puede reproducir de forma fiable.
- Licencia Apache-2.0, que permite uso comercial, pero el uso de las imagenes generadas debe acompanarse de una advertencia clara de que son sinteticas y no reproducciones de documentos reales.
- No se han publicado evaluaciones cuantitativas de fidelidad paleografica ni de calidad de las etiquetas generadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gabriel/diffu-moss-hand-overstathallarambetet-1715
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio diffu: https://github.com/Borg93/diffu2
