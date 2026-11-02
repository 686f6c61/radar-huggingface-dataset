# kyr0/defuss-lid-1.0

## Resumen

defuss-lid 1.0 es una coleccion de cuatro packs de identificacion de idioma (language identification, LID) empaquetados por kyr0 a partir de los pesos ya publicados de fastText `lid.176` y Google CLD3 (`cld3-asm` 4.0.0). No se ha entrenado ningun modelo desde cero: el trabajo consiste en recuantizar y reempaquetar modelos existentes en formato product-quantized (PQ) con cabezas clasificadoras en int8, de modo que puedan ejecutarse en Node, Bun y navegadores modernos mediante el runtime `defuss-lid`, sin servicio de inferencia ni addons nativos.

El problema que resuelve es el de la identificacion de idioma en el borde (edge): entornos donde no se quiere enviar texto a una API externa, donde no hay acceso a binarios nativos de fastText o CLD3, y donde el tamano del artefacto importa. Los packs ocupan entre 78 KB y 130 KB, lo que los hace adecuados para aplicaciones web, funciones serverless y dispositivos con recursos limitados.

La relevancia actual viene de la combinacion de tamano minimo, licencias permisivas en parte de los packs y un pipeline de evaluacion reproducible con hashes SHA-256 bloqueados. Los cuatro packs cubren desde un conjunto cerrado de 3 idiomas (`der_3`) hasta las 109 etiquetas de CLD3 (`full`), pasando por 6 idiomas (`deferi_6`) y 20 idiomas mayoritarios (`major_20`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText (packs `der_3`, `deferi_6`) y CLD3 (packs `major_20`, `full`); reempaquetado en product quantization con cabeza clasificadora int8 |
| Parametros totales | no disponible (el autor solo publica el tamano en bytes de cada pack) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificador de frases, no modelo generativo) |
| Tipos de cuantizacion | product quantization (PQ) con cabezas int8; packs `.dlid` (fastText) y `.cld3q` (CLD3) |
| Idiomas soportados | `der_3`: de, en, ru; `deferi_6`: de, en, fr, es, ru, it; `major_20`: en, de, fr, it, ru, id, es, pt, nl, ur, vi, th, zh, ja, pl, tr, ar, ko, bn, hi; `full`: 109 etiquetas CLD3 |
| Licencia | multiple: runtime MIT; `der_3` y `deferi_6` CC-BY-SA-3.0; `major_20` y `full` Apache-2.0 (ver `NOTICE.md`) |
| Formato de pesos | `.dlid` (fastText recuantizado) y `.cld3q` (CLD3 recuantizado); nucleo WASM compartido `runtime/cld3-core.bin.gz` para los packs CLD3 |

## Arquitectura y entrenamiento

No hay entrenamiento propio. Los packs `der_3` y `deferi_6` derivan de fastText `lid.176`, un clasificador lineal con representacion de n-gramas hasheados y bolsa de palabras; el reempaquetado aplica product quantization y poda de caracteristicas observadas en un corpus de calibracion de 100 frases por idioma extraidas de FLORES dev. Los packs `major_20` y `full` derivan de CLD3, que reconstruye el layout nativo WASM en tiempo de carga y reduce el tamano de descarga y almacenamiento, pero no la RAM de inferencia.

La innovacion tecnica principal es el empaquetado: los cuatro artefactos son byte-identicos a los medidos en el repositorio fuente `defuss-lid` v0.3.0, con hashes SHA-256 bloqueados en `config.json` y en `reports/v0.3/build-lock.json`. La evaluacion se hizo sobre FLORES-200 devtest (1.012 frases por idioma, alineadas) y MASSIVE 1.1 test (2.974 enunciados por locale), medida el 2026-11-02 y reverificada byte a byte en una maquina independiente. No se documenta RLHF ni DPO porque no es un modelo generativo.

## Capacidades

- Identificacion de idioma top-1 sobre texto de entrada, devolviendo una lista de `{language, score}` ordenada.
- Conjuntos cerrados por pack: solo compiten las etiquetas de la allowlist de cada pack.
- Flag `reliable` en la salida del pack `full` (CLD3) para indicar fiabilidad de la prediccion.
- Ejecucion en Node, Bun y navegadores modernos mediante el runtime `defuss-lid`, sin servicio de inferencia ni addons nativos.
- Carga desde assets npm empaquetados o desde descargas directas de HuggingFace (`LidModel.fromBuffer`, `loadModel`, `createCld3Pack`, `loadCld3Pack`).
- Verificacion de integridad del nucleo WASM compartido en tiempo de carga.
- No soporta rechazo de idiomas no soportados ni se reclama precision en mezcla de idiomas o code-switching.
- No es un modelo generativo: no hay tool calling, agentes, vision ni audio.

## Casos de uso

- Deteccion de idioma en el cliente web: el pack `major_20` (110 KB) o `deferi_6` (127 KB) se cargan en el navegador y clasifican el texto del usuario antes de enviarlo al backend, evitando exponer texto a servicios externos.
- Enrutado de peticiones en APIs multilingues: usar `deferi_6` para decidir a que pipeline de traduccion o modelo generativo enviar cada consulta segun el idioma detectado (de, en, fr, es, ru, it).
- Moderacion y analitica de contenido en el borde: clasificar idioma en funciones serverless o workers de Cloudflare con `der_3` (78 KB) para etiquetar grandes volumenes de texto sin coste de inferencia remota.
- Preprocesado en pipelines de NLP: usar `full` (109 etiquetas) para etiquetar corpus antes de entrenar modelos especificos por idioma, aceptando su menor precision en textos cortos.
- Filtrado en herramientas de desarrollador: detectar el idioma de mensajes de commit, issues o documentacion para asignar revisores o rutas de traduccion, con `major_20` como compromiso entre cobertura y tamano.
- Aplicaciones offline o de escritorio Electron: empaquetar `der_3` o `deferi_6` como asset local para clasificacion de idioma sin red, apropiado por su tamano inferior a 130 KB.
- Verificacion de integridad en produccion: usar los hashes SHA-256 publicados en `config.json` para auditar que el pack desplegado es byte-identico al artefacto medido.

## Benchmarks y rendimiento

Precision top-1 (%) sobre FLORES-200 devtest y MASSIVE 1.1 test, medidas por el autor el 2026-11-02. Las puntuaciones no son probabilidades calibradas.

| Pack | FLORES completo | FLORES primeros 20 code points | MASSIVE |
|---|---:|---:|---:|
| `der_3` | 100,00 | 98,42 | 98,54 |
| `deferi_6` | 99,97 | 93,74 | 96,92 |
| `major_20` | 99,65 | 91,39 | 95,03 |
| `full` | 97,77 | 78,80 | 88,60 |

Cohortes: 3.036 / 6.072 / 20.240 / 78.936 registros FLORES y 8.922 / 17.844 / 62.454 / 154.648 registros MASSIVE para los conjuntos de 3/6/20/full. Las evaluaciones de inventario completo cubren las 78 etiquetas (FLORES) y 51 (MASSIVE) compartidas por ambos modelos, no todas las etiquetas. Los packs de conjunto cerrado solo compiten dentro de su propia allowlist, por lo que las puntuaciones entre packs no son comparables.

## Requisitos de hardware

- RAM de inferencia: los packs CLD3 reconstruyen el layout WASM nativo en carga y reducen descarga y almacenamiento, no la RAM de inferencia; el autor no publica cifras de RAM.
- Almacenamiento: 78.048 bytes (`der_3`), 127.488 bytes (`deferi_6`), 110.428 bytes (`major_20`), 130.404 bytes (`full`), mas el nucleo WASM compartido `runtime/cld3-core.bin.gz` para los packs CLD3.
- GPU: no aplica; la inferencia es en CPU sobre fastText o WASM.
- Cabe en cualquier GPU consumer y en cualquier dispositivo con un runtime JS moderno (Node, Bun, navegador).
- Despliegue: runtime `defuss-lid` (npm), con condiciones de exportacion `node` y `default` para seleccionar el loader; compatible con bundlers web.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamano | Licencia | Ejecucion |
|---|---|---|---|---|---|
| defuss-lid 1.0 `full` | CLD3 recuantizado | 109 etiquetas | 130.404 bytes | Apache-2.0 | JS/WASM (Node, Bun, navegador) |
| fastText `lid.176` original | fastText | 176 etiquetas | no disponible | CC-BY-SA-3.0 | binario nativo / bindings |
| Google CLD3 original | CLD3 | 109 etiquetas | no disponible | Apache-2.0 | binario nativo / `cld3-asm` |
| defuss-lid 1.0 `der_3` | fastText recuantizado | 3 idiomas | 78.048 bytes | CC-BY-SA-3.0 | JS/WASM |

La ventaja diferencial de defuss-lid frente a los originales es el tamano reducido y la ejecucion sin dependencias nativas; la contrapartida es la perdida de cobertura (176 frente a 109 etiquetas en el pack `full`) y la ausencia de rechazo de idiomas no soportados. No se dispone de datos de rendimiento de los originales en la informacion proporcionada para comparar precision de forma directa.

## Limitaciones y advertencias

- Los packs pequenos sacrifican precision en textos cortos y fuera de dominio; `full` pierde sobre todo en el corte artificial de 20 code points (78,80 %).
- No existe un pack mejor independiente del dominio: el autor recomienda evaluar sobre la distribucion propia.
- Los packs fastText (`der_3`, `deferi_6`) podan caracteristicas observadas en un corpus de calibracion de 100 frases por idioma de FLORES dev; caracteristicas validas fuera de ese corpus estan ausentes por construccion.
- Los buckets de n-gramas hasheados pueden colisionar entre idiomas.
- No hay rechazo de idiomas no soportados ni se reclama precision en mezcla de idiomas o code-switching; restringir candidatos no hace fiable la deteccion de idiomas no soportados.
- Las puntuaciones no son probabilidades calibradas.
- Las puntuaciones entre packs no son comparables porque cada conjunto cerrado compite solo dentro de su allowlist.
- Licencia multiple: `der_3` y `deferi_6` son CC-BY-SA-3.0 (copyleft, requiere atribucion y compartir igual), lo que puede condicionar el uso comercial; `major_20` y `full` son Apache-2.0. Revisar `NOTICE.md` para la atribucion completa.
- Los packs CLD3 no reducen la RAM de inferencia, solo el tamano de descarga y almacenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/kyr0/defuss-lid-1.0
- Repositorio fuente: https://github.com/kyr0/defuss-lid
- Paquete npm del runtime: https://www.npmjs.com/package/defuss-lid
- Dataset FLORES: https://huggingface.co/datasets/facebook/flores
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
