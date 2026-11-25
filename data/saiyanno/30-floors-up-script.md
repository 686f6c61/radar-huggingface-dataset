# Saiyanno/30-floors-up-script

## Resumen

`Saiyanno/30-floors-up-script` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que distribuye un supuesto paquete ejecutable para Windows de 64 bits (archivo `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip`, 4,8 MB, protegido con contraseña `2026`) presentado por su autor como un "script" o "cheat trainer" para videojuegos. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje: únicamente una model card con instrucciones de descarga y ejecución.

La model card está escrita en un tono promocional con insignias, tablas de "características" (escáner dinámico de offsets, overlay externo a 144 Hz, radar 2D, filtro de loot, tecla de pánico, capa de render "stream-proof") y enlaces de descarga que apuntan a un repositorio de GitHub de terceros (`Roussel10024/inzoi-cheat-trainer-mod-menu`) distinto del citado en el propio texto (`ArjunRyu/30-floors-up-script`). Esa discrepancia entre el origen declarado y el destino real de la descarga, junto con la contraseña de descompresión y las instrucciones de ejecutar como administrador, son señales de alerta clásicas de distribución de software potencialmente malicioso.

Desde el punto de vista de evaluación de modelos, la ficha no puede completarse con datos técnicos reales porque no existen. El repositorio tiene cero descargas y cero "likes" en el momento de la consulta y fue creado el 24 de noviembre de 2026. Se documenta a continuación lo que hay, con las advertencias correspondientes, para que ningún lector lo confunda con un modelo open source utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete ejecutable para Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` con un `.exe`, no pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El contenido del repositorio es una model card en Markdown con enlaces a un archivo ZIP alojado en GitHub Releases. El ZIP declarado contiene un binario `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe` (build `v2.7.5`, identificador `709BC6376E`) que, según la descripción, se ejecuta con privilegios de administrador sobre Windows 10/11 de 64 bits.

Las "características" descritas (escáner asíncrono de offsets con sondeo a 278 Hz, perfiles JSON intercambiables en caliente a 345 Hz, overlay externo a 144 Hz con cajas 2D/3D y esqueletos de huesos, radar 2D, filtro de loot, tecla de pánico `END`, capa de exclusión de captura para OBS/ShadowPlay/Discord, uso de menos de 49 MB de RAM) corresponden a funcionalidades típicas de herramientas de trampas para videojuegos, no a capacidades de un modelo generativo. No hay información sobre dataset, tokens, RLHF, DPO ni innovación técnica alguna en el ámbito de la IA.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo (los idiomas listados son etiquetas de metadatos del repositorio).
- No dispone de modo "thinking", visión, audio ni ninguna modalidad de IA.
- Lo único que declara ofrecer es un ejecutable de Windows con funciones descritas como "cheat trainer" para videojuegos (overlay, radar, filtro de loot, perfiles de configuración, tecla de pánico).

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA. Los escenarios que la model card sugiere son:

- Ejecución de un binario de terceros en un equipo Windows con privilegios de administrador, lo que amplía la superficie de ataque del sistema.
- Uso de supuestas funciones de trampa en videojuegos, lo que habitualmente infringe los términos de servicio de las plataformas y puede conllevar el baneo de cuentas.
- Descarga de un archivo ZIP protegido con contraseña desde un repositorio de GitHub no verificado, un patrón habitual en campañas de distribución de malware.
- Ninguno de estos escenarios es recomendable para desarrolladores o investigadores; se listan únicamente para dejar constancia de lo que el repositorio declara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro tipo, porque el artefacto no es un modelo evaluable. Las cifras que aparecen en la model card (278 Hz, 345 Hz, 99,5 % de consistencia, menos de 49 MB de RAM) son afirmaciones del autor sin verificación independiente y no constituyen benchmarks de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos ni inferencia).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10/11 de 64 bits, ejecución como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de sondeo de la model card no son verificables.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Saiyanno/30-floors-up-script` | Paquete ejecutable Windows (no IA) | no aplica | no aplica | MIT (declarada) | Hugging Face, 0 descargas |
| Modelo de lenguaje open source (categoría general) | Transformer / MoE | millones a miles de millones | miles a cientos de miles de tokens | Apache-2.0, MIT, Llama, etc. | Hugging Face, ampliamente descargado |
| Modelo de visión-lenguaje open source | Transformer multimodal | variable | variable | variable | Hugging Face |

No existe una categoría de modelos comparables porque el repositorio no contiene un modelo. Cualquier comparación con un LLM, un modelo multimodal o un modelo de código sería engañosa.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para generación de texto, código, razonamiento ni ninguna tarea de aprendizaje automático.
- Discrepancia de origen: la model card cita el repositorio `ArjunRyu/30-floors-up-script`, pero el enlace de descarga apunta a `Roussel10024/inzoi-cheat-trainer-mod-menu`; esta incoherencia es una señal de riesgo.
- Distribución mediante ZIP protegido con contraseña (`2026`) y ejecutable que requiere privilegios de administrador: patrón habitual en la distribución de software malicioso o no auditado.
- Riesgo de seguridad: ejecutar binarios de procedencia no verificada puede comprometer el sistema, robar credenciales o instalar código malicioso.
- Riesgo legal y de plataforma: las herramientas de trampa en videojuegos suelen violar los términos de servicio y pueden acarrear sanciones.
- La licencia MIT declarada no aporta ninguna garantía sobre el contenido del binario ni sobre su comportamiento en ejecución.
- Cero descargas y cero interacciones en el repositorio: no hay comunidad, auditoría ni evidencia de uso legítimo.
- No debe confundirse este repositorio con un modelo open source en ninguna evaluación técnica, comparativa o pipeline de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Saiyanno/30-floors-up-script
- Repositorio citado en la model card: https://github.com/ArjunRyu/30-floors-up-script
- Repositorio de destino real del enlace de descarga: https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu
- Enlace de descarga directa declarado (no recomendado): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- No se han encontrado papers, blogs técnicos, demos ni documentación adicional en la información disponible.
