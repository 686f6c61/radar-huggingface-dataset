# oxford-lob/overleaf-studio

## Resumen

Overleaf Studio es una extension de VS Code, no un modelo de lenguaje. El repositorio `oxford-lob/overleaf-studio` alojado en Hugging Face contiene el codigo fuente y el paquete `.vsix` de una herramienta que reproduce la experiencia de edicion de Overleaf dentro del editor de Microsoft: arbol de ficheros, editor de codigo LaTeX y vista previa del PDF en un mismo panel, con compilacion mediante Tectonic y sincronizacion bidireccional con proyectos de Overleaf a traves de git.

El objetivo de la herramienta es ofrecer un flujo de trabajo LaTeX local y sin dependencia de la nube, manteniendo la posibilidad de publicar cambios en Overleaf con un diff a nivel de palabra antes de hacer commit, rebase y push. Incluye SyncTeX bidireccional, guardado seguro con fusion o recarga de cambios externos y modos de compilacion normal, borrador y continuacion ante errores.

Es relevante para desarrolladores e investigadores que escriben documentos cientificos en LaTeX y quieren evitar el entorno web de Overleaf sin renunciar a su integracion git. No hay arquitectura de red neuronal, parametros ni contexto que reportar: la ficha se limita a documentar la herramienta segun la informacion disponible en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (extension de VS Code, no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz esta en ingles; incluye traduccion opcional al chino mediante Google Translate) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye como `.vsix` y codigo fuente; no hay pesos) |

## Arquitectura y entrenamiento

No aplica: Overleaf Studio no es un modelo entrenado. Es una extension de VS Code escrita en JavaScript que se ejecuta sobre Node.js 18 o superior y se empaqueta con `@vscode/vsce`. Su arquitectura funcional se compone de un panel con arbol de ficheros, esquema del documento, editor y vista previa PDF; un motor de compilacion que invoca el binario de Tectonic; y un modulo de sincronizacion git que clona el proyecto desde `https://git.overleaf.com/<project-id>` y gestiona commit, rebase y push.

El repositorio no incluye paso de build: se clona directamente en la carpeta de extensiones de VS Code o se empaqueta como `.vsix`. Las pruebas se ejecutan con `node --test` y con un script de sincronizacion de navegador que requiere Chromium headless (Playwright) o la variable `CHROME_PATH`. No hay datos de entrenamiento, RLHF ni innovaciones de inferencia que documentar.

## Capacidades

- Edicion LaTeX con diseno tipo Overleaf: arbol de ficheros, esquema del documento, editor y PDF en paralelo, con modos de panel dividido, solo editor o solo PDF.
- Compilacion con Tectonic en modos normal, borrador y "continuar ante errores", con autocompilacion opcional y reejecucion de BibTeX cuando cambia un fichero `.bib`.
- SyncTeX bidireccional: salto del codigo fuente al PDF y del PDF al codigo.
- Guardado seguro: los cambios se guardan de inmediato; los cambios externos en disco se fusionan o recargan, y si ambas partes cambian se conserva una copia de recuperacion y se ofrece un diff.
- Push a Overleaf con revision previa de un diff a nivel de palabra, seguido de commit, rebase y push en un clic, mostrando destino, cuenta y autor del commit antes de enviar.
- Ajustes de editor: keymaps de Vim y Emacs, temas, tipografias, autocompletado de `\ref` y `\cite` y correccion ortografica.
- Extras opcionales desactivados por defecto: traduccion al chino parrafo a parrafo mediante Google Cloud Translation y analisis de escritura con IA mediante Pangram (requiere clave API) o GPTZero (experimental, requiere puente de navegador integrado).
- No incluye tool calling, razonamiento multi-paso ni capacidades multimodales propias; las funciones de IA son integraciones externas opcionales.

## Casos de uso

- Edicion local de articulos cientificos: un investigador abre su proyecto de Overleaf clonado por git y edita `.tex` con vista previa PDF instantanea compilada por Tectonic, sin depender de la interfaz web.
- Publicacion controlada en Overleaf: antes de enviar cambios, el autor revisa el diff a nivel de palabra contra el remoto y confirma commit, rebase y push desde el propio editor, reduciendo el riesgo de sobrescribir trabajo ajeno.
- Colaboracion con coautores en la nube: el flujo git permite mantener el repositorio de Overleaf como fuente de verdad mientras se trabaja en local con guardado inmediato y fusion de cambios externos.
- Navegacion de documentos largos: SyncTeX bidireccional permite saltar entre una linea del fuente y su posicion en el PDF, util en tesis y articulos de decenas de paginas.
- Revision de estilo y deteccion de texto generado por IA: con las claves correspondientes, el autor puede lanzar escaneos de Pangram o GPTZero sobre fragmentos seleccionados antes de enviar un manuscrito.
- Lectura asistida de bibliografia en otros idiomas: la vista de traduccion opcional traduce parrafos al chino mediante Google Translate, pensada para autores que redactan o revisan en ese idioma.
- Entornos sin conectividad: el editor funciona sin conexion salvo las funciones opcionales de traduccion y escaneo, lo que permite escribir y compilar en portatiles o servidores aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no procede comparar con MMLU, HumanEval, GSM8K ni metricas equivalentes. El repositorio no reporta tiempos de compilacion, latencia de sincronizacion ni throughput.

## Requisitos de hardware

- No requiere GPU: es una extension de VS Code.
- Requiere Node.js 18 o superior para ejecutar las pruebas.
- Requiere el binario de Tectonic en el `PATH` o configurado en `overleafStudio.tectonicPath`.
- Requiere git y credenciales configuradas para el repositorio de Overleaf si se usa la funcion de push.
- Las pruebas de navegador requieren Chromium headless (Playwright) o la variable `CHROME_PATH`.
- Despliegue: instalacion del `.vsix` con `code --install-extension overleaf-studio-0.1.0.vsix` o mediante la vista de extensiones de VS Code ("Install from VSIX...").
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Compilacion | Sincronizacion con Overleaf | Licencia | Distribucion |
|---|---|---|---|---|---|
| Overleaf Studio | Extension de VS Code | Tectonic local | Git (clone, commit, rebase, push) | MIT | `.vsix` y codigo fuente |
| Overleaf (web) | Editor en la nube | Servidores de Overleaf | Nativa | Propietaria | SaaS |
| LaTeX Workshop (VS Code) | Extension de VS Code | TeX Live, latexmk, etc. | No integrada | MIT | Marketplace de VS Code |
| Tectonic (CLI) | Compilador LaTeX | Tectonic | No aplica | MIT | Binarios y cargo |

La comparativa se limita a herramientas del mismo ambito funcional, ya que no existen modelos de IA comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona ni responde a prompts; cualquier expectativa en ese sentido es erronea.
- La version publicada es 0.1.0 y el repositorio tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere un proyecto muy reciente y sin validacion comunitaria.
- La integracion con GPTZero se marca como experimental y requiere un puente de navegador integrado separado.
- Las funciones de traduccion y escaneo de IA envian texto a servicios externos (Google Translate, Pangram, GPTZero) y estan desactivadas por defecto; deben revisarse las implicaciones de privacidad antes de activarlas en manuscritos confidenciales.
- La licencia MIT cubre el codigo propio, pero el codigo y las tipografias de terceros incluidos mantienen sus propias licencias, detalladas en `THIRD_PARTY_NOTICES.md`.
- El proyecto no esta afiliado ni respaldado por Overleaf; el uso de su integracion git queda sujeto a los terminos del servicio de Overleaf.
- No se documentan sesgos, riesgo de alucinacion ni limitaciones de contexto por no tratarse de un modelo generativo.
- La interfaz esta en ingles y la documentacion no detalla compatibilidad con versiones concretas de VS Code ni de Tectonic.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/oxford-lob/overleaf-studio
- Paquete `.vsix` 0.1.0: https://huggingface.co/oxford-lob/overleaf-studio/resolve/main/overleaf-studio-0.1.0.vsix
- Tectonic: https://tectonic-typesetting.github.io/
- Instalacion de Tectonic: https://tectonic-typesetting.github.io/en-US/install.html
- Clonado git del repositorio: `git clone https://huggingface.co/oxford-lob/overleaf-studio`
- Overleaf (servicio): https://www.overleaf.com/
