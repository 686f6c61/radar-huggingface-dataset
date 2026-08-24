# Gaze-tovich-377/DanichAI60-v3-beta

## Resumen

DanichAI60 v3 beta es un modelo experimental de generación de imágenes desarrollado por Gaze-tovich-377, que emplea un enfoque radicalmente distinto a los generadores basados en difusión o VAE: en lugar de predecir píxeles o latentes, codifica cada marco como una tabla de índices numéricos obtenidos mediante cuantización vectorial. El marco se divide en baldosas (tiles) y cada una se sustituye por un código de un diccionario aprendido; la reconstrucción es una simple búsqueda en tabla, sin red neuronal, lo que reduce el coste de decodificación a 0.48 ms por marco frente a los ~500 ms de un VAE convencional, y el diccionario ocupa entre 3 y 12 MB en lugar de los 13.1 GB de un VAE típico.

El modelo consta de dos etapas: la primera (stage1) modela la conectividad entre baldosas vecinas, y la segunda (stage2_text) incorpora control por texto. El sistema completo tiene 35.9 millones de parámetros, lo que en cuantización de 4 bits supone solo 17 MB. Se trata de una versión beta y de investigación: no produce imágenes finales listas para uso, sino que su valor reside en las mediciones del codificador, el muestreador y en los resultados negativos documentados que orientan futuras líneas de trabajo. El autor lo ha probado sobre el modelo WAN 2.2 5B para validar el muestreador, con un pico de memoria de 12.1 GB y una penalización de espera del 3%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuantizacion vectorial en dos etapas (stage1: conectividad de baldosas; stage2: control por texto) con codebooks de baldosas de 4×4, 8×8 y 64×64 |
| Parametros totales | 35.9 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (generacion de imagenes, no texto) |
| Tipos de cuantizacion | Cuantizacion de 4 bits mencionada (17 MB), sin especificar formato exacto |
| Idiomas soportados | no disponible (el modelo no procesa texto como entrada principal; la model card esta en ruso) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) para las etapas, NumPy (.npy) para los codebooks |

## Arquitectura y entrenamiento

El sistema se compone de dos redes neuronales ligeras (stage1 y stage2_text) junto con tres codebooks de cuantizacion vectorial. El codificador divide cada marco en baldosas de tamaño fijo (4×4, 8×8 o 64×64) y asigna a cada baldosa un indice de un diccionario de 16384 o 65536 entradas. La reconstruccion es una simple sustitucion por diccionario, sin red neuronal, lo que explica la velocidad de 0.48 ms por marco. La primera etapa predice la conectividad entre baldosas vecinas, mientras que la segunda incorpora descripciones textuales para influir en la seleccion de codigos. El entrenamiento se realizo con 67 clips de videojuegos de 5 minutos cada uno, un material limitado que condiciona la generalidad del modelo. No se menciona el uso de RLHF ni DPO; el enfoque es puramente supervisado sobre la tarea de reconstruccion y prediccion de baldosas. El muestreador, sin pesos propios, hace crecer cinco frentes de semillas que se expanden en ondas, abriendo en cada paso las celdas con mayor confianza, lo que evita imponer un orden de recorrido y elimina costuras en los puntos de encuentro.

## Capacidades

- Generacion de texturas plausibles: el modelo produce superficies continuas sin costuras ni roturas, aunque no llega a dibujar escenas completas.
- Reconstruccion de marcos a alta velocidad: 0.48 ms por marco frente a ~500 ms de un VAE, gracias a la decodificacion por diccionario.
- Control por texto: la influencia de la descripcion textual esta demostrada experimentalmente (diferencia de 28.9 sobre 255 en la salida con y sin texto).
- Muestreador con crecimiento de frentes: disenado para evitar costuras y funcionar sobre otros modelos (probado con WAN 2.2 5B).
- Compresion eficiente: el diccionario ocupa entre 3 y 12 MB, y el modelo completo en 4 bits pesa 17 MB.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades de vision en el sentido de los LLM multimodales.

## Casos de uso

- Investigacion en cuantizacion vectorial: el modelo sirve como banco de pruebas para estudiar el impacto del tamano de baldosa frente al tamano del diccionario, con resultados medidos (PSNR de 36.1 dB con baldosas 4×4 y diccionario 16384).
- Compresion de video de baja latencia: la decodificacion por tabla permite reconstruir marcos en menos de medio milisegundo, lo que podria aplicarse en sistemas de transmision en tiempo real donde el ancho de banda es limitado.
- Generacion de texturas para entornos virtuales: las baldosas reconstruidas forman superficies continuas, utiles para rellenar fondos o materiales en aplicaciones de graficos por computador.
- Validacion de muestreadores para modelos de difusion: el muestreador de frentes multiples se ha probado sobre WAN 2.2 5B, demostrando que puede integrarse en pipelines de generacion de video con un coste de memoria aceptable (12.1 GB).
- Estudio de resultados negativos: la documentacion explicita que la paleta bajo indicacion, la compresion de un bit y la metrica por pesos grandes fallan, lo que ahorra tiempo a otros investigadores que eviten esos caminos.
- Desarrollo de codificadores jerarquicos: la idea de dos niveles (mapa grueso 11×11 para composicion y detalle fino) esta premeditada y medida (21.8 dB con 121 numeros), lo que puede guiar futuras arquitecturas de generacion de video.

## Benchmarks y rendimiento

Los datos de rendimiento se basan en mediciones propias del autor, no en benchmarks estandarizados como MMLU o HumanEval (no aplicables a un modelo de generacion de imagenes). Se presentan los resultados publicados:

| Prueba | Resultado |
|---|---|
| PSNR de reconstruccion con baldosa 32×32, diccionario 65536 | 24.0 dB |
| PSNR de reconstruccion con baldosa 16×16, diccionario 65536 | 26.9 dB |
| PSNR de reconstruccion con baldosa 8×8, diccionario 16384 | 30.0 dB |
| PSNR de reconstruccion con baldosa 4×4, diccionario 16384 | 36.1 dB |
| PSNR de reconstruccion con baldosa 2×2, diccionario 16384 | 40.3 dB |
| Precision de stage1 con 25% de celdas ocultas (linea base 39.8%) | 38.6% |
| Precision de stage1 con 50% de celdas ocultas (linea base 36.7%) | 36.3% |
| Precision de stage1 con 75% de celdas ocultas (linea base 26.4%) | 32.2% |
| Precision de stage2 con texto, 25% oculto | 38.2% |
| Precision de stage2 sin texto, 25% oculto | 35.8% |
| Precision de stage2 con texto, 50% oculto | 38.2% |
| Precision de stage2 sin texto, 50% oculto | 35.2% |
| Precision de stage2 con texto, 75% oculto | 38.3% |
| Precision de stage2 sin texto, 75% oculto | 35.3% |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en 4 bits ocupa 17 MB, por lo que cabe en cualquier GPU, incluso en tarjetas integradas. La inferencia de la etapa de codificacion es ligera y puede ejecutarse en CPU.
- GPU recomendadas: no se requiere una GPU especifica; cualquier GPU con al menos 1 GB de VRAM es suficiente para el modelo base. Para el muestreador sobre WAN 2.2 5B se necesita una GPU con al menos 12.1 GB de VRAM (probado con exito).
- Compatibilidad con GPU de consumo: si, el modelo es compatible con RTX 2060, RTX 3060, RTX 4090 y similares, asi como con GPUs de generaciones anteriores.
- Opciones de despliegue: al ser un modelo experimental, no hay integraciones oficiales con vLLM, llama.cpp, Ollama o TGI. El codigo se distribuye como archivos .pt y .npy, por lo que el despliegue requiere un script propio en PyTorch.
- Latencia y throughput: la decodificacion por diccionario tarda 0.48 ms por marco; la etapa de prediccion de conectividad no tiene una latencia publicada, pero al ser una red pequena se espera que sea del orden de milisegundos.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada. El enfoque de cuantizacion vectorial pura sin red de decodificacion es unico en su categoria. Como referencia conceptual, se puede comparar con un VAE convencional:

| Modelo | Parametros | Decodificacion | Peso del decodificador | Velocidad de decodificacion |
|---|---|---|---|---|
| DanichAI60 v3 | 35.9 M | Sustitucion por diccionario | 3-12 MB | 0.48 ms/marco |
| VAE tipico (referencia) | no disponible | Red neuronal | ~13.1 GB | ~500 ms/marco |

La comparacion muestra una ventaja clara en velocidad y tamano, aunque el VAE produce reconstrucciones de mayor calidad en terminos de escena completa, mientras que DanichAI60 solo genera texturas.

## Limitaciones y advertencias

- No dibuja escenas: el modelo produce texturas plausibles, pero no logra representar la estructura semantica de una imagen (por ejemplo, "vagon de metro" y "bosque" se diferencian entre si, pero no se asemejan a lo solicitado).
- No sirve como soporte para difusion: un experimento de control demostro que img2img sobre el borrador no mejora respecto a partir de ruido puro, lo que indica que el borrador no aporta informacion de escena.
- Material de entrenamiento limitado: solo 67 clips de videojuegos de 5 minutos, lo que restringe la generalidad a ese dominio.
- Version beta y de investigacion: no produce imagenes finales listas para produccion; su valor es metodologico.
- Resultados negativos documentados: la paleta bajo indicacion, la compresion de un bit y la metrica por pesos grandes fallan, lo que debe tenerse en cuenta para evitar replicar esos enfoques.
- Riesgo de alucinacion: al ser un modelo de generacion de texturas, puede producir patrones que no corresponden a la entrada, aunque no se ha cuantificado este aspecto.
- Sin soporte para uso comercial garantizado: aunque la licencia es Apache 2.0, el modelo es experimental y no se ha validado para entornos de produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Gaze-tovich-377/DanichAI60-v3-beta
- Video demostrativo del muestreador: https://www.youtube.com/watch?v=HhUAR-MrsD0
- Google Colab (posiblemente relacionado, sin confirmar): https://colab.research.google.com/drive/11s5IQkI8H-kIn00Kg6Sqp-dD3RwsICdE
