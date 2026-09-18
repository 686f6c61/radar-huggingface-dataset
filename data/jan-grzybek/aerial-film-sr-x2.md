# jan-grzybek/aerial-film-sr-x2

## Resumen

Aerial Film SR ×2 es un modelo de superresolución de escala fija ×2 especializado en película aérea histórica escaneada. Lo desarrolla jan-grzybek y se distribuye con licencia CC BY 4.0 en HuggingFace. El problema que aborda es concreto: un vuelo de reconocimiento de mediados del siglo XX llega al investigador como un escaneo de negativo, y ese escaneo suele ser más grueso que la propia película. Un negativo a 1:5.000 de los años cincuenta contiene detalle a una décima de metro que un escaneo a 0,2 m/px reduce a la mitad; este modelo intenta recuperar ese detalle sin dibujar estructura donde no la hay.

La arquitectura es RealPLKSR (Partial Large Kernel CNN for Efficient Super-Resolution), en la variante que Philip Hofmann entrenó como `4xNomosWebPhoto_RealPLKSR`: 64 canales, 28 bloques, kernel de 17 píxeles y 7.368.908 parámetros (unos 7,37 M). El modelo parte de ese checkpoint público ×4 mediante una construcción exacta de una cola ×2 que reproduce «×4 y media por bloques ÷2» con un error de 4·10⁻⁷ antes de cualquier entrenamiento.

Su relevancia no está en el tamaño, sino en el objetivo de entrenamiento: un adversario cuya señal se pondera según una máscara de evidencia del propio input, de forma que en terreno plano (solares vacíos, agua, escombros, campos) no se premia inventar textura. El checkpoint publicado es el de la iteración 8.000, elegido entre los que superan una «puerta de invención» medida sobre película real no vista durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RealPLKSR (Partial Large Kernel CNN), 64 canales, 28 bloques, kernel de 17 px |
| Parametros totales | 7.368.908 (≈7,37 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; procesa teselas de 256 px con 32 px de contexto recortados por borde interior) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas del checkpoint) |
| Idiomas soportados | No aplica: el modelo no procesa texto y trabaja sobre un unico canal de luminancia |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors, cargable con spandrel |
| Escala | Fija ×2 |
| Pipeline en HuggingFace | image-to-image |
| Modelo base | Phips/4xNomosWebPhoto_RealPLKSR |

## Arquitectura y entrenamiento

El backbone es RealPLKSR, la red convolucional de superresolución de kernel grande y parcial descrita por Lee, Kim y Park en arXiv:2404.11848. El modelo parte del checkpoint público `4xNomosWebPhoto_RealPLKSR` de Philip Hofmann, también CC BY 4.0, y construye una cola ×2 exacta que reproduce el comportamiento «×4 seguido de media por bloques ÷2» con un error de 4·10⁻⁷ antes de empezar a entrenar. En inferencia, la entrada es una imagen en escala de grises a su resolución original: la luminancia se replica en los tres canales de entrada y los tres canales de salida se promedian de vuelta. Las imágenes grandes se procesan por teselas de 256 píxeles con 32 píxeles de contexto recortados en cada borde interior.

Los datos de entrenamiento son película real en ambos lados de cada par: el objetivo es un recorte de un negativo de vuelo del IGN a la resolución a la que lleva detalle real, y la entrada es su media por bloques, degradada hasta las estadísticas del material sobre el que se despliega el modelo. En total, 149.867 recortes sobre cinco resoluciones de verdad (0,11; 0,18; 0,37; 0,73 y 1,46 m/px), extraídos de 650 fotogramas de 210 misiones IGN PVA sobre ciudades francesas voladas entre 1940 y 1965, reservando misiones completas fuera de las usadas para medir. La degradación (desenfoque, grano añadido, parches con desplazamiento de placa y una aumentación tonal) se calibró por resolución contra un archivo de catorce vuelos aéreos de Varsovia escaneados de película entre 1935 y 1994.

El objetivo de entrenamiento separa cada recorte en banda de estructura y banda de textura mediante un filtro guiado. La estructura se entrena solo por fidelidad, con un término Charbonnier más términos VGG y FFT, de modo que nada premia trazar un borde que la evidencia no respalda. La textura mantiene vivo el grano del filme con un ajuste de energía de grano a ganancia 1,05 y un adversario de tipo hinge. Ese adversario es la innovación central: su gradiente llega a cada parche en proporción a una máscara de evidencia del input (uno donde la banda alta del filme supera 1,5 veces su mediana, cero sobre película plana). Se añaden un término que prohíbe energía y orientación de banda alta más allá de las del input donde la máscara es cero, y la propia puerta de invención como función de pérdida, calculada sin verdad sobre 421 teselas planas del archivo de Varsovia. Veinte mil iteraciones con AdamW y decaimiento coseno; el checkpoint de la iteración 8.000 se eligió por distancia a la verdad entre los que pasan la puerta en todas las evaluaciones, descartando los posteriores por sobretexturizar progresivamente.

## Capacidades

- Superresolución ×2 de imágenes en escala de grises procedentes de escaneos de película aérea histórica.
- Entrada de cualquier tamaño, gestionada internamente por teselado de 256 px con solape y recorte de contexto.
- Preservación de grano: ajuste explícito de energía de grano a ganancia 1,05, orientado a que el resultado no parezca plástico ni sobresuavizado.
- Restricción de invención en terreno plano: el adversario y el término «nada de nada» limitan la creación de energía de banda alta y de orientación donde el input no la tiene.
- Recuperación de detalle estructural (aristas de tejado, chimeneas, vehículos, bordillos) solo donde el negativo lo sostiene.
- Integración con la puerta de invención en la selección de checkpoint: se publica el modelo que pasa el filtro en todas las evaluaciones.
- Encadenamiento documentado con el modelo complementario Aerial Film Restorer, que se ejecuta después del ×2 y se encarga de tono y grano.
- Carga directa mediante spandrel, lo que permite usarlo en herramientas compatibles sin código propio.

No hay soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo de imagen a imagen, no un modelo de lenguaje.

## Casos de uso

- Digitalización de vuelos históricos del IGN: recuperar el detalle efectivo de un negativo volado a 1:5.000 cuando solo se dispone de un escaneo a 0,37 m/px, obteniendo una salida a 0,18 m/px con el detalle que el escaneo antiguo ya no resuelve.
- Ortofotografía histórica y análisis de cambio urbano: generar una capa a resolución fina y comparable con ortofotos modernas para medir transformaciones del tejido urbano entre 1940 y 1965.
- Preprocesado para detección automática de edificios: al no inventar aristas sobre solares vacíos ni escombros, el ×2 reduce los falsos positivos de un detector de tejados entrenado sobre estas imágenes.
- Arqueología del paisaje: realzar lindes, caminos y estructuras agrarias sobre campos, donde el modelo mantiene la textura solo si el negativo la lleva, lo que permite distinguir trazas reales de artefactos de interpolación.
- Cartografía catastral y reconstrucción de parcelarios: ampliar recortes de casco urbano para digitalizar linderos y viario apoyándose en la resolución a la que el negativo realmente lleva detalle.
- Patrimonio y publicación editorial: preparar láminas ampliadas de archivo para exposiciones o publicaciones, encadenando el ×2 con Aerial Film Restorer para devolver tono y grano coherentes.
- Estudios de dinámica fluvial y costera: ampliar series temporales de cauces y riberas donde el modelo evita la creación de estructuras lineales espurias que falsearían la medición de anchuras.
- Reconstrucción de series completas de misiones: al ser un modelo convolucional de 7,37 M de parámetros, permite procesar catálogos enteros por lotes en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card describe tres instrumentos de evaluación, pero sin cifras asociadas en el material disponible:

| Instrumento | Que mide | Numero de resultados publicados |
|---|---|---|
| Banco calibrado | 120 recortes reservados por resolución de verdad; tres ratios de energia contra la resolucion fina del propio film (detalle en estructura, detalle en film plano o grano, tono a gran escala), mas PSNR de referencia | No disponible |
| Puerta de invencion | Siete vuelos de Varsovia a su nivel mas fino; 60 de las teselas mas planas de cada uno; componentes conexos alargados creados por cada mil pixeles de salida que el input no tiene, y ratio de energia de banda alta frente al input | No disponible |
| Pipeline | 40 pares reservados de escaneo crudo del IGN y ortofoto limpia producida por el IGN desde los mismos fotografos, ×2 y despues restaurado, puntuado contra la imagen limpia | No disponible |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 7.368.908 parametros, unos 29,5 MB en fp32 y unos 14,7 MB en fp16. La VRAM de inferencia esta dominada por el teselado (256 px con solape) y el almacenamiento de activaciones, no por los pesos; deberia caber holgadamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer con soporte CUDA, incluida una GTX 1650 o una RTX 3050; tambien tarjetas de datacenter (A100, H100) para procesado por lotes a gran escala, aunque estan muy sobredimensionadas para 7,37 M de parametros.
- Cabe en GPU consumer: si, en cualquiera con al menos 2 GB de VRAM, e incluso en iGPU modernas si el backend lo permite.
- CPU: viable para volúmenes pequenos o medianos, al tratarse de una CNN pequena; la latencia dependera del backend.
- Opciones de despliegue: PyTorch nativo; spandrel (y por tanto ComfyUI, chaiNNer y herramientas compatibles); exportacion a ONNX u otros runtimes no documentada en la informacion disponible. No hay soporte de vLLM, TGI, llama.cpp ni Ollama, que son runtimes para modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware, del tamano de tesela y del numero de teselas por fotograma.

## Comparativa con modelos similares

| Modelo | Parametros | Escala | Contexto / enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aerial Film SR ×2 (jan-grzybek) | 7,37 M | ×2 | Pelicula aerea historica; adversario ponderado por mascara de evidencia para no inventar en terreno plano | CC BY 4.0 | HuggingFace, safetensors, spandrel |
| Phips/4xNomosWebPhoto_RealPLKSR (modelo base) | No disponible | ×4 | Superresolucion de fotografia web/real; mismo backbone RealPLKSR | CC BY 4.0 | HuggingFace |
| Aerial Film Restorer (jan-grzybek) | No disponible | No disponible | Restauracion complementaria: asume tono y grano del material historico; se ejecuta despues del ×2 | No disponible | HuggingFace |
| Interpolacion bicubica | No aplica | Cualquiera | Referencia de la puerta de invencion: no crea componentes conexos alargados | No aplica | Integrada en cualquier libreria de imagen |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, escala, licencia y disponibilidad.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado con pelicula aerea historica en un unico canal de luminancia. No esta pensado para fotografia en color, fotografia moderna, imagenes naturales, ilustracion ni capturas de pantalla.
- Escala fija ×2: no admite factores arbitrarios ni ×4 directo. Para un ×4 habria que encadenar dos pasadas u otro modelo.
- Entrada monocroma: la salida es una media de tres canales, no una reconstruccion cromatica. Si el material de origen tiene color, el modelo no lo aprovecha.
- Riesgo de invencion mitigado, no eliminado: la puerta de invencion y el termino «nada de nada» reducen la creacion de estructura sobre terreno plano, pero el modelo sigue siendo generativo en la banda de textura. En terreno ambiguo puede aparecer detalle plausible no respaldado por el negativo.
- Dependencia de la calibracion de degradacion: el desenfoque, el grano y los parches con desplazamiento de placa se calibraron contra un archivo concreto (vuelos de Varsovia, 1935-1994). Escaneos con caracteristicas muy distintas (otro escaner, otro revelado, otra densidad) pueden caer fuera de esa distribucion.
- Sesgo geografico y temporal de los datos: misiones francesas del IGN entre 1940 y 1965 en el entrenamiento, mas la calibracion polaca. No hay garantia de comportamiento equivalente sobre archivos de otras regiones, emulsiones o epocas.
- Seleccion de checkpoint por regla estricta: se publica el de la iteracion 8.000 porque los posteriores sobretexturizan. Es una decision conservadora que prioriza no inventar sobre nitidez aparente.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion al autor y mantiene los terminos de esa licencia; conviene revisar tambien la licencia del modelo base.
- Sin datos publicos de rendimiento numerico: no hay cifras de PSNR ni de los ratios de energia en el material disponible, por lo que no se puede cuantificar la mejora frente a un interpolador clasico sin ejecutar la evaluacion uno mismo.
- Modelo de investigacion con escasa traccion: 0 descargas y 1 like en el momento de redactar la ficha. No hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jan-grzybek/aerial-film-sr-x2
- Modelo base: https://huggingface.co/Phips/4xNomosWebPhoto_RealPLKSR
- Modelo complementario de restauracion: https://huggingface.co/jan-grzybek/aerial-film-restorer
- Paper de la arquitectura (Partial Large Kernel CNNs for Efficient Super-Resolution): https://arxiv.org/abs/2404.11848
- Figura de ejemplo (Lyon, vuelo IGN del 26 de junio de 1954): https://huggingface.co/jan-grzybek/aerial-film-sr-x2/resolve/main/examples/film-0.183.png
