# PhilippLinux/mia3-postmarketos

## Resumen

`PhilippLinux/mia3-postmarketos` no es un modelo de inteligencia artificial: es un repositorio de imagenes de sistema operativo postmarketOS para el Xiaomi Mi A3 (nombre en clave `laurel_sprout`), publicado como espejo del build generico listo del repositorio GitHub `philipplinux/mia3-postmarketos`, con una carpeta por release. El repositorio ocupa 4,4 GB y contiene los artefactos necesarios para instalar Linux en la particion B del telefono mediante fastboot, dejando Android intacto en la particion A. Lo mantiene Philipp Baumann (PhilippLinux), autor tambien de imagenes equivalentes para otros dispositivos.

El problema que resuelve es practico: reutilizar un telefono Android antiguo como servidor Linux siempre encendido, sin perder la posibilidad de volver a Android, con un proceso de instalacion reproducible y verificable. La model card describe el flasheo manual con `fastboot` y una alternativa de flasheo desde el navegador (Chrome/Edge, fastboot sobre WebUSB) que descarga las imagenes desde el propio repositorio y comprueba el SHA-256 antes de escribir.

Es relevante ahora por dos motivos: el hardware movil de segunda mano es abundante y barato, y el proyecto demuestra un flujo de publicacion de imagenes de sistema en Hugging Face con verificacion de integridad. Conviene subrayar que las etiquetas del repositorio (`postmarketos`, `xiaomi-mi-a3`, `laurel_sprout`) y el campo `pipeline` vacio confirman que no hay ningun modelo entrenado ni inferencia asociada. Esta ficha adapta la estructura habitual de evaluacion de modelos a un artefacto de tipo firmware/imagen de sistema, indicando explicitamente cuando un campo no aplica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una imagen de sistema operativo postmarketOS) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible en la model card |
| Licencia | `other`; los blobs de firmware incluidos en el rootfs proceden de la ROM oficial de Xiaomi y conservan sus licencias originales |
| Formato de pesos | no aplica; artefactos de imagen: `boot.img`, `vbmeta.img`, `rootfs.img` |
| Dispositivo objetivo | Xiaomi Mi A3 (`laurel_sprout`, plataforma `sm61x5`) |
| Sistema operativo | postmarketOS, build generico listo (espejo del repositorio GitHub) |
| Version de kernel | no disponible en la model card |
| Metodo de instalacion | fastboot manual o flasheo WebUSB desde navegador Chromium con verificacion SHA-256 |
| Particiones usadas | slot `b` (`vbmeta_b`, `boot_b`, `userdata`); Android permanece en slot `a` |
| Credenciales por defecto | usuario `user`, contrasena `changeme` (se deben cambiar) |
| Red | el telefono queda accesible en `172.16.42.1` por USB |
| Requisito previo | bootloader desbloqueado |
| Tamano del repositorio | 4,4 GB |
| Fechas | creado el 2026-10-15, actualizado el 2026-10-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red neuronal. El repositorio distribuye una imagen `rootfs.img` de postmarketOS, un `boot.img` con el kernel y el initramfs, y un `vbmeta.img` para la verificacion de arranque, organizados por release en carpetas independientes. La instalacion escribe `vbmeta_b`, borra `dtbo_b`, escribe `userdata` con el rootfs y flashea `boot_b`, para despues marcar el slot `b` como activo con `fastboot set_active b`. Este esquema A/B permite conservar Android en el slot `a` y volver a el sin reinstalar el sistema original, a costa de que el flasheo de `userdata` borra todos los datos de usuario de Android.

El contenido del rootfs combina paquetes de postmarketOS con blobs de firmware extraidos de la ROM oficial de Xiaomi, que mantienen sus licencias originales; de ahi que la licencia global del repositorio sea `other` y no una licencia libre homogenea. La model card no documenta la version de kernel, la configuracion de paquetes ni el proceso de build, y no menciona ningun tipo de entrenamiento, ajuste fino, RLHF o DPO, lo cual es coherente con la naturaleza del artefacto. El flujo de flasheo web anade una innovacion practica relevante: descarga desde el mismo repositorio y verifica el SHA-256 antes de escribir, lo que reduce el riesgo de imagenes corruptas o manipuladas.

## Capacidades

- Arrancar Linux (postmarketOS) en el Xiaomi Mi A3 desde el slot `b`, manteniendo Android disponible en el slot `a`.
- Servir como maquina Linux siempre encendida con acceso por SSH a traves de la red USB en `172.16.42.1`.
- Ejecutar cargas de trabajo de servidor ligeras: contenedores, agentes de red, servicios HTTP, tareas programadas, sujeto a los recursos del telefono (SoC `sm61x5`, RAM y almacenamiento no documentados en la model card).
- Instalar software adicional mediante el gestor de paquetes de postmarketOS (Alpine `apk`), aunque la model card no detalla el conjunto de paquetes incluido.
- Flasheo reproducible y verificable: fastboot manual o WebUSB con comprobacion de integridad SHA-256.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, agentes ni soporte multilingue; no es un modelo de lenguaje.

## Casos de uso

- Servidor domestico siempre encendido: el telefono, con el bootloader desbloqueado y la imagen en el slot `b`, queda como un nodo Linux de bajo consumo accesible por SSH; es adecuado porque elimina la dependencia de un PC encendido y reutiliza hardware que de otro modo quedaria obsoleto.
- Nodo de acceso remoto: instalando un cliente de red superpuesta (por ejemplo Tailscale, como describe el hilo de XDA sobre el build Nura) el dispositivo puede actuar como punto de entrada a la red domestica; la conexion USB a `172.16.42.1` sirve para la configuracion inicial.
- Laboratorio de pruebas de kernel y drivers: al conservar Android en el slot `a`, se puede iterar sobre el kernel de Linux y volver al sistema original con `fastboot set_active a`, lo que reduce el riesgo de dejar el telefono inutilizable.
- Host de contenedores para servicios personales: con Docker u otro runtime disponible en postmarketOS, el telefono puede ejecutar pequenos servicios (sincronizacion de ficheros, monitorizacion, DNS interno); la idoneidad depende de la RAM y del almacenamiento, no documentados.
- Dispositivo de doble uso Android/Linux: para quien necesita Android como telefono principal y Linux para tareas puntuales, el esquema A/B permite alternar sin flashear de nuevo, a costa de reiniciar.
- Banco de pruebas de despliegue y flasheo automatizado: el flujo WebUSB con verificacion SHA-256 y los scripts `simple-install/flash.sh` sirven para validar pipelines de aprovisionamiento de dispositivos en entornos de laboratorio.
- Docencia y formacion en sistemas embebidos: el repositorio ofrece un caso real de arranque A/B, particiones `vbmeta`/`dtbo`, fastboot y blobs de firmware, con la advertencia de que es experimental y sin garantia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no es un modelo de IA y no admite metricas del tipo MMLU, HumanEval o GSM8K; tampoco se documentan en la model card datos de rendimiento del sistema (latencia de arranque, throughput de red, consumo) que permitan una comparacion cuantitativa.

## Requisitos de hardware

- Dispositivo: Xiaomi Mi A3 (`laurel_sprout`) con bootloader desbloqueado.
- VRAM para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica (A100, H100, RTX 4090 y similares no intervienen).
- Cabida en GPU de consumo: no aplica.
- Host para el flasheo: PC con `fastboot` y cable USB, o navegador Chrome/Edge con soporte WebUSB para el flasheo desde el navegador.
- Almacenamiento: aproximadamente 4,4 GB para descargar el repositorio o la release concreta, mas el espacio temporal durante la verificacion y escritura.
- Opciones de despliegue: fastboot manual (`fastboot flash vbmeta_b`, `fastboot erase dtbo_b`, `fastboot flash userdata rootfs.img`, `fastboot flash boot_b`, `fastboot set_active b`, `fastboot reboot`) o el instalador web del proyecto.
- Latencia y throughput: no disponible; la model card no publica mediciones. La unica referencia de red es la direccion fija `172.16.42.1` sobre USB.

## Comparativa con modelos similares

| Alternativa | Tipo | Dispositivo | Contexto / parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `PhilippLinux/mia3-postmarketos` | Imagen postmarketOS (build generico) | Xiaomi Mi A3 | no aplica | `other` (blobs Xiaomi) | Hugging Face + GitHub |
| `PhilippLinux/s9-postmarketos` | Imagen postmarketOS del mismo autor | Samsung Galaxy S9 (segun el nombre del repositorio) | no aplica | no disponible | Hugging Face; citado en la actividad del autor |
| postmarketOS oficial | Distribucion Linux para moviles | Multiples dispositivos | no aplica | licencias por componente | GitLab de postmarketOS |
| Android de fabrica (slot `a`) | Sistema Android original | Xiaomi Mi A3 | no aplica | propietaria de Xiaomi | preinstalado en el dispositivo |
| Build Nura / postmarketOS (hilo de XDA) | Imagen postmarketOS con modulos fuera de arbol, cambios de device-tree y dashboard tactil | Xiaomi Mi A3 | no aplica | no disponible | foro XDA, no es el mismo artefacto que este repositorio |

La comparacion con modelos de IA no procede: no hay parametros, ventana de contexto ni benchmarks que contrastar. Frente a las alternativas, la diferencia practica de este repositorio es el espejo en Hugging Face con verificacion SHA-256 en el flasheo web; el build Nura descrito en XDA anade personalizaciones (kernel mainline 7.2, `sm61x5-mainline`, dashboard tactil) que no estan documentadas en esta model card y no deben atribuirse a estas imagenes.

## Limitaciones y advertencias

- Naturaleza del artefacto: no es un modelo de IA; cualquier evaluacion con metricas de lenguaje, codigo o vision carece de sentido.
- Caracter experimental: la propia model card indica "Experimental, no warranty"; no hay garantia de estabilidad ni de soporte.
- Borrado de datos: `fastboot flash userdata rootfs.img` elimina todos los datos de usuario de Android; hay que hacer copia de seguridad antes.
- Seguridad del bootloader: requiere desbloquear el bootloader, lo que reduce las garantias de integridad del dispositivo y puede afectar a servicios que dependen de la verificacion de arranque.
- Credenciales por defecto: el acceso inicial es `user` / `changeme`; debe cambiarse inmediatamente, especialmente si el telefono queda expuesto en red.
- Licencias heterogeneas: la licencia `other` agrega codigo de postmarketOS y blobs de firmware de Xiaomi con licencias originales; el uso comercial o la redistribucion requieren revisar cada componente, y la model card no ofrece un desglose.
- Ausencia de datos tecnicos: no se documentan version de kernel, RAM, almacenamiento, conjunto de paquetes ni consumo; sin esos datos no se puede planificar capacidad.
- Red limitada: el acceso documentado es por USB a `172.16.42.1`; no se detalla el soporte de Wi-Fi, Bluetooth, telefono o modem en este build.
- Riesgo de fallo durante el flasheo: aunque el instalador web verifica SHA-256, una interrupcion del proceso o un cable defectuoso puede dejar el dispositivo en un estado no arrancable; el slot `a` con Android mitiga pero no elimina el riesgo.
- Uso continuo como servidor: el hilo de XDA sobre el build Nura menciona mantener la bateria al 50 % y anadir guardas termicas para evitar hinchazon; son precauciones aplicables a cualquier telefono usado como servidor siempre encendido, aunque no estan documentadas en esta model card.
- Soporte comunitario: no hay canal de soporte formal ni versionado semantico documentado mas alla de "una carpeta por release".

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PhilippLinux/mia3-postmarketos
- Repositorio GitHub del proyecto: https://github.com/philipplinux/mia3-postmarketos
- Instalador web (fastboot sobre WebUSB): https://philipplinux.github.io/mia3-postmarketos/
- Perfil del autor en Hugging Face: https://huggingface.co/PhilippLinux
- Hilo de XDA sobre el Mi A3 como servidor Linux con postmarketOS (build Nura, no es este artefacto): https://xdaforums.com/t/linux-nura-postmarketos-mi-a3-as-a-linux-mainline-7-2-home-server-battery-wi-fi-bt-ir-gpu-speaker-touch-dashboard.4804894/
- Variante del mismo hilo con etiqueta `laurel_sprout`: https://xdaforums.com/t/linux-nura-postmarketos-laurel_sprout-mi-a3-as-a-linux-mainline-7-2-home-server-battery-wi-fi-bt-ir-gpu-speaker-touch-dashboard.4804894/
- GitLab de postmarketOS (policies y documentacion del proyecto): https://gitlab.postmarketos.org/
