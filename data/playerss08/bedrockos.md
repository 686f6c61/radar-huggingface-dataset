# PlayerSS08/BedrockOS

## Resumen

BedrockOS no es un modelo de inteligencia artificial, sino un sistema operativo completo escrito desde cero en Rust para plataformas UEFI, con una interfaz grafica inspirada en Minecraft. El proyecto, publicado por el usuario PlayerSS08 en Hugging Face, incluye kernel propio, controladores, pila de red, sistema de ficheros, escritorio y aplicaciones, y se distribuye como una imagen ISO de 40 MB lista para arrancar en VirtualBox o en hardware UEFI real.

El repositorio no contiene pesos de modelo, tokenizador, configuracion de transformer ni ningun artefacto propio de un modelo de lenguaje. El tamano del repo es de 0.0 GB y las etiquetas declaradas (`operating-system`, `rust`, `uefi`, `iso`) confirman que se trata de un artefacto de software de sistema, no de un modelo entrenado.

Por tanto, esta ficha documenta el artefacto tal y como aparece publicado, pero advierte de que la mayoria de los campos propios de una ficha de modelo (parametros, contexto, cuantizacion, benchmarks) no son aplicables y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (sistema operativo, no modelo de IA) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | No disponible (se distribuye una imagen ISO, `bedrockos.iso`) |

## Arquitectura y entrenamiento

El artefacto es una imagen ISO de un sistema operativo UEFI escrito en Rust, con kernel, controladores, pila de red (DHCP, DNS, TCP, HTTP, ping, curl), sistema de ficheros, escritorio con ventanas y un conjunto de aplicaciones (ChatBox, Notes, Tasks, Files, Calculator, Clock, Snake, Settings, Help, Network y el navegador Crafting Table). No existe proceso de entrenamiento, dataset ni ajuste por RLHF/DPO, ya que no es un modelo de aprendizaje automatico.

La unica innovacion tecnica documentada es la de un sistema operativo no basado en Linux, con soporte de arranque UEFI (Secure Boot desactivado), ejecucion en VirtualBox con EFI habilitado y un script auxiliar (`tools/bedrock-host.py`) que permite acceso a Wi-Fi y paginas HTTPS a traves del portatil anfitrion cuando se ejecuta en maquina virtual.

## Capacidades

- Arranque en UEFI en VirtualBox (tipo *Other*, 64-bit, 1024 MB de RAM, sin disco duro) y en PCs UEFI reales desde CD/DVD con Secure Boot desactivado.
- Pantalla de inicio de sesion y menu de arranque con fondo de cueva de Minecraft y texto splash amarillo.
- Escritorio con ventanas, dock, maximizar, barra superior con reloj, bateria y tooltips al pasar el raton.
- Aplicaciones incluidas: ChatBox (shell con mas de 100 comandos), Notes, Tasks, Files, Calculator, Clock, Snake, Settings, Help, Network y el navegador web Crafting Table.
- Notificaciones estilo "Achievement get!" y fondo de pantalla que sigue el ciclo dia/noche.
- Red: DHCP, DNS, TCP, HTTP, ping y curl.
- Wi-Fi y paginas HTTPS a traves del portatil anfitrion cuando se ejecuta en VirtualBox mediante `tools/bedrock-host.py`.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingueismo propias de un modelo de IA.

## Casos de uso

- Evaluacion de sistemas operativos experimentales: permite arrancar un SO UEFI no basado en Linux en una maquina virtual para estudiar su kernel, controladores y pila de red sin tocar hardware real.
- Docencia de desarrollo de sistemas: sirve como ejemplo practico de escritura de un SO en Rust con UEFI, util en asignaturas de sistemas operativos o ingenieria de bajo nivel.
- Pruebas de arranque UEFI: valida el firmware UEFI y la configuracion de Secure Boot de un equipo o de una VM antes de desplegar otros sistemas.
- Demostracion de interfaces graficas: el escritorio con ventanas, dock y notificaciones sirve como referencia para prototipos de UI en Rust.
- Simulacion de red en laboratorio: la pila DHCP/DNS/TCP/HTTP y el script de puente permiten experimentar con conectividad desde una VM sin configurar red avanzada en el hipervisor.
- Uso recreativo o educativo: la tematica Minecraft y las notificaciones "Achievement get!" lo hacen adecuado para talleres introductorios de sistemas o para demostraciones en eventos.
- Pruebas de persistencia: al ser un CD de solo lectura, permite verificar el comportamiento de aplicaciones sin estado (notas y tareas no persisten entre arranques), util para validar disenos de almacenamiento efimero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- RAM minima indicada por el autor: 1024 MB para la maquina virtual en VirtualBox.
- Sin disco duro requerido en la VM: el sistema arranca desde la ISO como unidad optica.
- Firmware: UEFI obligatorio (en VirtualBox, activar *Enable EFI*; en hardware real, Secure Boot desactivado).
- Soporte de arranque desde CD/DVD en PCs UEFI reales.
- GPU recomendadas: no disponible (no se documentan requisitos de aceleracion grafica).
- VRAM estimada: no disponible (no aplica a un SO).
- Opciones de despliegue: VirtualBox (documentado), hardware UEFI real desde CD/DVD (documentado). No se documentan otros hipervisores ni plataformas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Sistema | Tipo | Lenguaje | Arranque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BedrockOS | SO UEFI desde cero | Rust | UEFI, VirtualBox, CD/DVD | other | Hugging Face (repo PlayerSS08/BedrockOS) |
| Linux (kernel + distro) | SO basado en Linux | C, Rust (parcial) | BIOS/UEFI | GPL y otras | Amplia |
| Redox OS | SO tipo Unix en Rust | Rust | BIOS/UEFI | MIT | Repositorio publico |
| SerenityOS | SO tipo Unix desde cero | C++ | BIOS/UEFI | BSD-2-Clause | Repositorio publico |

No se dispone de datos de rendimiento comparativo entre estos sistemas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni soporta tool calling; cualquier uso como modelo de lenguaje es inviable.
- El CD es de solo lectura: las notas y tareas no se conservan entre arranques.
- Requiere Secure Boot desactivado en hardware real, lo que reduce la seguridad del arranque.
- La licencia es "other" sin texto adicional en la informacion disponible; se desconoce si permite uso comercial, modificacion o redistribucion.
- El repositorio no incluye pesos, tokenizador ni configuracion; el tamano del repo es de 0.0 GB y las descargas y likes son 0, lo que sugiere un proyecto muy reciente o poco difundido.
- No se documentan idiomas de interfaz ni localizacion; la model card esta en ingles.
- El soporte de Wi-Fi y HTTPS depende del script `tools/bedrock-host.py` y del portatil anfitrion en VirtualBox; no se garantiza en hardware real.
- No hay datos de benchmarks, latencia, throughput ni requisitos de GPU, por lo que no es posible evaluar su rendimiento de forma cuantitativa.
- El autor indica credenciales por defecto (usuario `BedrockOS`, contrasena `MinecraftSS_08`), lo que constituye un riesgo de seguridad si se usa en entornos compartidos.

## Enlaces

- Hugging Face: https://huggingface.co/PlayerSS08/BedrockOS
- Imagen ISO: `bedrockos.iso` (40 MB, SHA-256 `39643db91d5d692cc9a746ef0ed614e824624b07f0c09256907822709786ee48`), referenciada en la model card del repositorio
- Script de red para VirtualBox: `tools/bedrock-host.py`, referenciado en la model card
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
