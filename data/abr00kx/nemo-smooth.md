# abr00kx/nemo-smooth

## Resumen

nemo-smooth no es un modelo de inteligencia artificial, sino una bifurcación (fork) optimizada del gestor de archivos Nemo, el explorador de ficheros oficial del entorno de escritorio Cinnamon de Linux Mint. Lo desarrolla el usuario abr00kx y se publica en Hugging Face bajo la etiqueta `nemo`, lo que provoca que aparezca en búsquedas de modelos, pero su contenido es código fuente C/GTK3, no pesos neuronales. El proyecto parte de la rama `master` de Nemo posterior a la versión 6.8.4 (commit `33892205`) y aplica una serie de optimizaciones de rendimiento medidas con `perf` y verificadas por comparación de píxeles.

El problema que aborda es el rendimiento deficiente del renderizado en GTK3: repintados completos de ventana en cada fotograma, recálculo de etiquetas y miniaturas en cada desplazamiento, e invalidación de la caché de píxeles en la vista de lista. nemo-smooth reduce el trabajo por fotograma en la vista de iconos de 17 ms a 6,3–6,8 ms, eleva la tasa de fotogramas de 38–40 fps a 53–59 fps en desplazamiento continuo y acelera la generación de miniaturas JPEG en caché fría de 31,5 s a 3,6 s para 150 fotos de 12 megapíxeles. Incluye además una compilación opcional solo para Wayland (`-Dx11=false`).

Es relevante para desarrolladores de escritorio Linux y mantenedores de entornos GTK3 que quieran estudiar técnicas concretas de optimización de repintado, caché de miniaturas y decodificación JPEG con escalado DCT. No tiene ninguna relación con modelos de lenguaje, visión o aprendizaje automático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación de escritorio en C sobre GTK3 (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (interfaz heredada de Nemo upstream) |
| Licencia | GPL-2.0 |
| Formato de pesos | no disponible (código fuente C; distribución vía repositorio y parches) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: nemo-smooth es una aplicación GTK3 compilada con Meson y Ninja, con dependencia adicional de `libjpeg`. La base es Nemo upstream (posterior a 6.8.4, commit `33892205`). Los cambios se distribuyen como 10 parches en el directorio `patches/`, cada uno con explicación y mediciones en su mensaje de commit.

Las innovaciones técnicas documentadas son: (1) desplazamiento animado con rueda del ratón, con deslizamiento de 160 ms con ease-out temporizado por el reloj de fotogramas; (2) eliminación de repintados ocultos de ventana completa mediante `nemo_view_paints_over` y `nemo_view_draw_around`; (3) caché de etiquetas de texto y miniaturas escaladas; (4) conservación de la caché de píxeles de GtkTreeView en la vista de lista mediante `eel_gtk_tree_view_keep_pixel_cache_on_scroll`; (5) decodificación JPEG directa a tamaño de miniatura con escalado DCT de libjpeg a 1/2, 1/4 o 1/8, con rotación EXIF; (6) actualización de iconos visibles limitada a cada 50 ms y decodificación de miniaturas en hilo trabajador; (7) compilación solo Wayland sin libX11. Las mediciones se realizaron en un portátil de 2014 (Haswell i7-4712MQ, HD 4600) a escala 2x, en un compositor wlroots headless con renderizador GLES2.

## Capacidades

- Gestión de archivos con vistas de iconos, lista y dividida, heredadas de Nemo upstream.
- Desplazamiento animado con rueda del ratón configurable mediante `org.nemo.preferences smooth-scrolling`.
- Decodificación rápida de miniaturas JPEG con escalado DCT y rotación EXIF, configurable mediante `org.nemo.preferences fast-jpeg-thumbnails`.
- Generación de miniaturas durante el desplazamiento continuo, con limitación a 50 ms.
- Compilación solo Wayland sin dependencia de libX11 ni XWayland.
- Soporte de teclas multimedia mediante nombres de tecla de GDK.
- Análisis de `--geometry` sin Xlib.
- Herramientas de benchmark incluidas: `libnemo-scroll-bench.so`, `bench.py`, `perf-breakdown.sh` y el prototipo GTK4 en `tools/gtk4-proto/`.

## Casos de uso

- Sustitución del gestor de archivos en Cinnamon: instalación sobre Nemo upstream para obtener desplazamiento más fluido en equipos modestos, con las mismas capturas de pantalla salvo la barra de desplazamiento superpuesta.
- Análisis de rendimiento de GTK3: uso de `tools/scroll-bench/bench.py` con `--perf` y `perf-breakdown.sh` para desglosar el coste por fotograma en vistas de iconos y lista.
- Validación de regresiones visuales: `bench.py shot --values 0,9000` compara capturas de ambas compilaciones y detecta diferencias de píxeles, útil en pipelines de integración continua.
- Exploración de directorios con miles de archivos: la vista de lista con 10.000 ficheros baja de 38 ms a 21 ms de trabajo por fotograma (de 21 fps a 33 fps).
- Gestión de bibliotecas fotográficas: generación de miniaturas en caché fría de 150 JPEG de 12 megapíxeles en 3,6 s frente a 31,5 s upstream.
- Despliegue en sesiones Wayland puras: compilación con `-Dx11=false` para evitar XWayland en entornos que lo prohíben.
- Estudio de migración a GTK4: el prototipo `tools/gtk4-proto/` mide el desplazamiento con `GtkGridView` y `GtkColumnView` antes de abordar un port.

## Benchmarks y rendimiento

| Métrica | Upstream | nemo-smooth |
|---|---:|---:|
| Vista de iconos, desplazamiento continuo: trabajo por fotograma (mediana) | 17 ms | 6,3–6,8 ms |
| Vista de iconos, desplazamiento continuo: fotogramas por segundo | 38–40 fps | 53–59 fps |
| Vista de iconos, rueda del ratón: fotogramas por segundo | 19–25 fps | 52–56 fps |
| Rueda del ratón: movimiento por muesca | salto de 84 px | deslizamiento de ~28–36 px por fotograma |
| Vista de lista, 10.000 archivos: trabajo por fotograma | 38 ms | 21 ms |
| Vista de lista, 10.000 archivos: fotogramas por segundo | 21 fps | 33 fps |
| 150 JPEG de 12 megapíxeles, caché de miniaturas fría | 31,5 s | 3,6 s |
| Miniaturas mostradas durante desplazamiento rápido | aproximadamente un tercio | la mayoría |

Medido en un portátil de 2014 (Haswell i7-4712MQ, HD 4600) a escala 2x, en compositor wlroots headless con renderizador GLES2. No se han publicado resultados de benchmarks de modelos de IA en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo neuronal).
- GPU recomendadas: no aplica; el renderizado usa GLES2 vía GTK3. Las mediciones se hicieron con una Intel HD 4600 integrada.
- Cabe en cualquier equipo que ejecute Cinnamon con GTK3; el portátil de referencia es de 2014.
- Opciones de despliegue: compilación con Meson y Ninja (`meson setup build --buildtype=debugoptimized -Dgtk_layer_shell=true`, añadiendo `-Dx11=false` para solo Wayland) e instalación con `sudo meson install -C build`. Con ccache, una compilación limpia tarda unos 45 s en 8 hilos.
- Latencia y throughput: ver tabla de benchmarks; el trabajo por fotograma en vista de iconos se sitúa en 6,3–6,8 ms de mediana.

## Comparativa con modelos similares

| Proyecto | Base | Cambios de rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| nemo-smooth | Nemo master post-6.8.4 (commit 33892205) | 17 ms → 6,3–6,8 ms por fotograma en iconos; miniaturas JPEG 31,5 s → 3,6 s | GPL-2.0 | Hugging Face (abr00kx/nemo-smooth) y parches en `patches/` |
| Nemo upstream | linuxmint/nemo | Referencia sin optimizar | GPL-2.0 | GitHub linuxmint/nemo |
| Nautilus (GNOME Files) | GTK4/libadwaita | No comparable directamente; otra base y toolkit | GPL-3.0 | GNOME |
| Thunar (Xfce) | GTK3 | No comparable directamente; otra base | GPL-2.0 | Xfce |

No se dispone de datos de rendimiento de Nautilus ni Thunar en la información proporcionada para una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: publicarlo bajo la etiqueta `nemo` en Hugging Face puede confundir a quien busque modelos de NVIDIA NeMo.
- `fast-jpeg-thumbnails` renuncia al sandbox de glycin para JPEG: decodifica dentro del proceso de Nemo con libjpeg-turbo. Se puede revertir con `gsettings set org.nemo.preferences fast-jpeg-thumbnails false`.
- El desplazamiento animado puede desactivarse con `gsettings set org.nemo.preferences smooth-scrolling false` o desactivando las animaciones de GTK.
- El renderizado busca coincidir píxel a píxel con upstream; en las comprobaciones solo difirió la barra de desplazamiento superpuesta por el momento de desvanecimiento.
- La compilación solo Wayland requiere `-Dx11=false` y evita XWayland independientemente de `GDK_BACKEND`; no se documentan pruebas en otras configuraciones.
- Licencia GPL-2.0: cualquier distribución derivada debe cumplir sus términos; no se documentan restricciones adicionales para uso comercial más allá de la propia GPL.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción ni de mantenimiento a largo plazo.
- Los benchmarks proceden de un único equipo de 2014 con compositor headless; el rendimiento en otros hardware y compositores no está documentado.
- No se dispone de información sobre sesgos, alucinaciones ni limitaciones idiomáticas porque no es un modelo lingüístico.

## Enlaces

- Hugging Face: https://huggingface.co/abr00kx/nemo-smooth
- Nemo upstream: https://github.com/linuxmint/nemo
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de parches o demos.
