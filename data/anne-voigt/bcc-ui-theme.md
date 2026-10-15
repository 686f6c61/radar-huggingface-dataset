# anne-voigt/bcc-ui-theme

## Resumen

`anne-voigt/bcc-ui-theme` no es un modelo de inteligencia artificial: es un paquete Python de presentacion (tema visual y hoja de estilos) para aplicaciones Gradio del Brenden-Colson Center. Su contenido es una subclase de `gr.themes.Base`, denominada `BCCTheme`, mas una hoja de estilos cuyos selectores estan acotados a `.gradio-container`. El objetivo declarado por el autor es que los agentes especialistas del centro, a los que se accede tanto por el orquestador como de forma directa, se lean como la superficie de un unico producto y no como aplicaciones independientes.

El paquete es deliberadamente minimo y sin comportamiento: no incluye activos de marca, no carga fuentes web y no impone un esquema de color. Exporta una funcion `theme()` que devuelve una instancia nueva de `BCCTheme` (no un singleton, porque Gradio muta el tema durante el renderizado), la constante `CSS` con la hoja de estilos compartida, `FOOTER_CSS` como opt-in separado para ocultar el pie de Gradio, y los tokens de paleta `LIGHT`, `DARK`, `CONTRACT` y la funcion `contrast_ratio()`.

Es relevante ahora por dos motivos concretos: primero, documenta con detalle el cambio de API entre Gradio 5.50 y 6.18 en torno a los argumentos `theme` y `css`, que pasan de `gr.Blocks(...)` a `demo.launch(...)`; segundo, su politica de accesibilidad es verificable mediante tests, con cada par de colores comprobado contra WCAG 2.2. No se ha publicado ninguna release: el propio README indica que nada se ha distribuido todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo de IA. Es un paquete Python con una subclase de `gr.themes.Base` y una hoja de estilos CSS |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | no disponible (no se declara licencia en la informacion proporcionada) |
| Formato de pesos | No aplica. Se distribuye como wheel `py3-none-any` (`bcc_ui_theme-<version>-py3-none-any.whl`) |
| Version del paquete | no disponible (ninguna release publicada segun el README) |
| Compatibilidad verificada | Gradio 5.50.0 sobre Python 3.11 y Gradio 6.18.0 sobre Python 3.13 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-15T18:37:01.000Z |
| Ultima actualizacion | 2026-10-15T18:44:35.000Z |
| Etiquetas | `region:us` |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento: el artefacto no se entrena, se compila. La pieza central es `BCCTheme`, una subclase de `gr.themes.Base` que utiliza exclusivamente palabras clave de `Base.set()` presentes tanto en Gradio 5.50 como en 6.18. El README cuantifica la superficie de compatibilidad: 5.50 acepta 262 palabras clave y 6.18 acepta 267, siendo el conjunto de 5.50 un subconjunto estricto, de modo que 5.50 actua como la restriccion vinculante. `Base.__init__` es identico en ambas versiones.

El diseno del sistema de estilos sigue tres decisiones explicitas. La primera es el aislamiento: todos los selectores de `CSS` estan acotados a `.gradio-container`, de modo que la hoja no puede filtrarse fuera del arbol de la aplicacion. La segunda es la separacion de responsabilidades: ocultar el pie de Gradio vive en `FOOTER_CSS`, fuera de `CSS`, porque suprimir la atribucion debe ser una decision deliberada de cada aplicacion. La tercera es la verificabilidad: los tokens de color viven en un modulo de datos (`_palette.py`) precisamente para que los tests puedan leerlos y detectar si una edicion de color deja una etiqueta por debajo de AA. El paquete incluye un test que comprueba que la hoja de estilos no contiene `__theme` ni `!important`, y otro que impide la entrada de cadenas de marca o activos embebidos.

## Capacidades

- Aplicacion de un tema visual coherente a aplicaciones Gradio mediante `demo.launch(theme=theme(), css=CSS)`.
- Exportacion de una instancia fresca de `BCCTheme` en cada llamada a `theme()`, para evitar el estado compartido que provocaria un singleton mutado durante el renderizado.
- Hoja de estilos con todos los selectores acotados a `.gradio-container`, evitando fugas de estilo.
- Ocultacion opcional del pie de Gradio mediante `FOOTER_CSS`, separada del estilo principal.
- Exportacion de la paleta (`LIGHT`, `DARK`, `CONTRACT`) y de `contrast_ratio()` para que los consumidores verifiquen sus propias adiciones de color.
- Soporte de modo claro y oscuro sin forzar ninguno de los dos: el tema se declara correcto en ambos.
- Compatibilidad con dos versiones mayores de Gradio (5.50 y 6.18) usando la forma `gr.Blocks(...)`, que funciona en ambas.
- Distribucion reproducible mediante pin a una URL inmutable de HuggingFace resolve, en lugar de instalacion desde git.
- Anillo de foco visible (`:focus-visible`) anadido de forma explicita, porque el valor por defecto de Gradio tiene bajo contraste sobre los dos fondos del tema.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues: no es un modelo.

## Casos de uso

- Unificacion visual de una flota de agentes: un equipo que despliega varios agentes Gradio (por ejemplo, un agente de subtipos de PDAC y otros especialistas) importa `theme()` y `CSS` en cada aplicacion para que todas compartan paleta, tipografia y espaciado, de modo que el usuario perciba un solo producto.
- Despliegue en HuggingFace Spaces sin peticiones externas: al no incluir fuentes web, la peticion de `preconnect` a `fonts.googleapis.com` que emite la plantilla de pagina de Gradio 5.50 desaparece en 6.18, y el Space se renderiza igual en entornos sin salida a internet. Resulta adecuado cuando el entorno de ejecucion esta aislado o se quiere reducir dependencias de terceros en la cadena de carga.
- Cumplimiento de accesibilidad en producto interno: un equipo con requisitos de WCAG 2.2 en herramientas internas puede apoyarse en el contraste ya medido (texto principal 17,99:1 en claro y 15,56:1 en oscuro) y en `contrast_ratio()` para validar cualquier color anadido antes de integrarlo.
- Plantilla de referencia para migrar de Gradio 5 a 6: el README documenta con numeros de linea (`gradio 6.18 blocks.py:2728`) el mecanismo de retrocompatibilidad por el que `Blocks.__init__` guarda el valor en `_deprecated_theme` / `_deprecated_css` y `launch()` lo rellena. Sirve como guia para otros equipos que deban atravesar la misma transicion de API.
- Empaquetado reproducible en CI/CD: el patron de pin a un wheel con URL de resolve inmutable evita el fallo conocido de `pip install git+https://huggingface.co/...` en builds de Spaces, porque el servidor git de HuggingFace no puede servir el clon parcial que necesita pip.
- Base para un design system interno: al exportar los tokens de paleta y el contrato de contraste como modulo de datos, el paquete puede servir de punto de partida para que un equipo derive sus propias variantes tematicas y las valide con los mismos tests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la informacion disponible, ya que el artefacto no es un modelo. Los unicos datos medidos que se publican son de contraste de accesibilidad y de cobertura de tests.

| Medicion | Modo claro | Modo oscuro | Criterio |
|---|---|---|---|
| Texto principal | 17,99:1 | 15,56:1 | WCAG 2.2 SC 1.4.3 (minimo 4,5:1) |
| Texto atenuado | 6,66:1 | 8,03:1 | WCAG 2.2 SC 1.4.3 (minimo 4,5:1) |
| Enlaces | 7,07:1 | 8,78:1 | WCAG 2.2 SC 1.4.3 (minimo 4,5:1) |
| Etiquetas de boton primario | 8,54:1 | 9,21:1 | WCAG 2.2 SC 1.4.3 (minimo 4,5:1) |
| Bordes de control | 3,11:1 | 3,84:1 | WCAG 2.2 SC 1.4.11 (minimo 3:1) |

| Prueba | Resultado |
|---|---|
| Suite completa en Gradio 5.50.0 / Python 3.11 | 46 tests superados |
| Suite completa en Gradio 6.18.0 / Python 3.13 | 46 tests superados |
| Comprobacion de pagina servida | Verifica que la hoja de estilos se entrega efectivamente |

## Requisitos de hardware

- GPU: no aplica. El paquete no ejecuta inferencia ni computo acelerado; se renderiza en el navegador del usuario final.
- VRAM: no aplica. No requiere memoria de GPU.
- CPU y memoria: no se publican cifras. El coste es el propio de importar un modulo Python y servir una hoja de estilos, insignificante frente a la aplicacion Gradio que lo consumidor.
- Caber en hardware de consumo: si, en cualquier equipo capaz de ejecutar Python 3.11 o 3.13 y Gradio 5.50 o 6.18. No hay requisito especifico de GPU ni de acelerador.
- Opciones de despliegue: HuggingFace Spaces (escenario previsto, segun el ejemplo de Spaces y el patron de distribucion descrito), aplicaciones Gradio autoalojadas y cualquier entorno que instale el wheel mediante pip. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables.
- Latencia y throughput: no disponible. No se publican mediciones; el impacto en tiempo de carga se limita a la entrega de la hoja de estilos.
- Versionado de dependencias: se ha verificado sobre Gradio 5.50.0 con Python 3.11 y Gradio 6.18.0 con Python 3.13. Para instalar en modo desarrollo, el repositorio ofrece `make test` (contra el entorno virtual activo) y `make test-both` (crea entornos desechables en ambas versiones de Gradio).

## Comparativa con modelos similares

No procede una comparativa entre modelos. La comparacion relevante es entre este paquete y las alternativas del mismo tipo que un consumidor tendria sobre la mesa, y no se dispone de datos publicados sobre ellas en la informacion proporcionada.

| Alternativa | Tipo | Datos disponibles |
|---|---|---|
| Tema por defecto de Gradio | Tema integrado de la libreria | Referencia implicita; el README solo senala que su `:focus-visible` tiene bajo contraste en ambos fondos, sin aportar cifras del resto de tokens |
| Tema propio por aplicacion | CSS y `gr.themes.Base` ad hoc en cada app | no disponible |
| Otros paquetes de tema para Gradio | Paquete de terceros | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA. Cualquier evaluacion basada en parametros, contexto, cuantizacion, benchmarks de razonamiento o capacidades linguisticas carece de sentido para este artefacto.
- Licencia no declarada en la informacion disponible. Antes de cualquier uso en produccion o redistribucion, hay que confirmar los terminos con el autor: la ausencia de licencia explicita impide asumir permisos de uso comercial.
- Ninguna version publicada. El README indica explicitamente que nada se ha liberado todavia y remite a `docs/ADOPTION.md`. No existe, por tanto, un wheel estable con el que fijar un pin.
- El paquete no incluye activos de marca por decision de diseno: los distintivos de OHSU no se consideran de uso propio y la paleta neutra evita sugerir un aval institucional al resultado de un agente. Un test impide la entrada de cadenas de marca o activos embebidos.
- La compatibilidad depende de la forma de llamada. `gr.Blocks(...)` funciona en ambas versiones mayores pero emite un aviso de deprecacion; `demo.launch(...)` solo funciona en la serie 6.x. En Gradio 5.50, pasar `theme` o `css` a `launch()` provoca `TypeError`. El propio README lo describe como argumento de mantenimiento, no de correccion.
- Diagnostico enganoso: bajo la forma de constructor, `demo.css` y `demo.theme` leen `None` aunque la hoja de estilos si este en la pagina. El README advierte de que la unica comprobacion fiable es la pagina servida.
- Gradio 5.50 emite por su cuenta un `preconnect` a `fonts.googleapis.com` desde su plantilla de pagina, con independencia de este paquete. Solo Gradio 6.18 lo elimina.
- No se publican datos de rendimiento, latencia ni comportamiento bajo carga, porque el artefacto no los produce de forma significativa.
- La busqueda web realizada no devolvio informacion relacionada con el proyecto: los resultados obtenidos tratan sobre el nombre propio «Anne» y no guardan relacion con el paquete. No hay fuente externa independiente que confirme o amplie lo descrito en la model card.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/anne-voigt/bcc-ui-theme
- Patron de pin de distribucion citado en el README: https://huggingface.co/anne-voigt/bcc-ui-theme/resolve/<sha>/bcc_ui_theme-<version>-py3-none-any.whl
- Repositorio de referencia del patron de distribucion, mencionado en el README como `biodata-registry`: no disponible
- Documento de adopcion, mencionado en el README como `docs/ADOPTION.md` dentro del propio repositorio: no disponible
- Script de release, mencionado en el README como `scripts/release.sh`: no disponible
- Paper o publicacion tecnica asociada: no disponible
