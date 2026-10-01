# enver/rootformer-v20.1-nrmt

## Resumen

Rootformer v20.1 — NRMT es un modelo de generación de texto desarrollado por el usuario enver, especializado en morfología del árabe clásico. La versión 20.1 es una release de arquitectura que modifica el modelo para que la predicción del siguiente root (raíz morfológica) sea un acto autorregresivo de primer nivel, en lugar de un subproducto del estado oculto. Sustituye a la v20 (reentrenamiento solo de pesos) y mantiene el backbone de v20 sin cambios, sobre el que monta las nuevas cabezas NRMT (`nrmt_head_full.pt`).

El modelo aborda un problema concreto: la cabeza anterior calculaba `root_logits = W · h_t`, una única proyección lineal desde el estado oculto final, pero la predicción del siguiente root depende sobre todo del flujo reciente de roots, no del estado oculto agregado. Un n-grama de 4 contaba con ≈ 33 % de acc@1 frente al ≈ 7,5 % de la cabeza original. La release identifica y corrige seis defectos (A-F) relacionados con la entrada explícita del historial de roots, la dirección del módulo engram, el condicionamiento sobre root gold frente a argmax, la consistencia de órbita, el operador de Sībawayh y la entrada de la tupla morfológica previa.

Se trata de un modelo muy especializado, con licencia Apache 2.0, orientado a investigación en morfología árabe clásica y decodificación restringida por gramática. Su relevancia es de nicho: publica una ablación honesta contra un control emparejado y un aviso de corrección sobre métricas anteriores (contaminación de benchmark). El tamaño del repositorio es de 0,1 GB y la ventana de contexto no está publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rootformer con cabezas NRMT (Next-Root-Morph-Token); backbone de enver/rootformer-v20 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible (la evaluacion usa contexto de 12 roots) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, fichero `nrmt_head_full.pt`); safetensors no disponible |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0,1 GB |
| Creado | 2026-09-30 |
| Actualizado | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo con un diseño derivado del backbone de Rootformer v20, sobre el que se anaden cabezas NRMT. La innovacion principal es que el historial reciente de roots se incorpora explicitamente como entrada: `h' = h + W_h[E(r₋₁);E(r₋₂);E(r₋₃)]`, con la termica inicializada a cero para que un checkpoint existente arranque numericamente inalterado y aprenda despues el termino. Ademas, se corrige la direccion del modulo engram (`DeepSeekEngramModule`, "radical root memory"), que estaba direccionado por posicion de secuencia en lugar de por root, pasando a fijar `current_root_ids` y `current_wazn_ids` desde los flujos morfemicos antes de cada llamada al backbone.

Las correcciones adicionales incluyen: muestreo programado (`ss_prob`) para alinear el condicionamiento (`cond_proj`) entre el root gold de entrenamiento y el argmax de inferencia; una perdida de consistencia de orbita sobre los 7.727 pares de permutacion S³ del inventario, para dar consistencia a los roots equivalentes por permutacion (*al-Taqālīb*); la lectura del estado del operador de Sībawayh (*al-ʿāmil*) como caracteristica (31 roots portadores de operador: JARR×10, INNA×9, KANA×5, NASB×3, JAZM×2, FUTURE×2); y el desplazamiento interno del historial de la tupla `(wazn, prefix, suffix)` previa. Se documentan dos bugs corregidos durante la validacion: el registro silencioso del wrapper flash como submodulo (581 claves fantasma duplicadas) y un termino aditivo de caracteristicas sin normalizar que disparo la PPL a 3,0 × 10⁴, resuelto con LayerNorm y dropout. El entrenamiento se realizo sobre 12.000 ventanas (1,52 M posiciones) con protocolo e hiperparametros identicos entre el control y el modelo completo. La model card no detalla la composicion completa del dataset, el numero total de tokens de preentrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Prediccion del siguiente root morfologico (NRMT) en arabe clasico, con metricas de acc@1 y acc@5.
- Prediccion de la tupla morfologica asociada (wazn, prefijo, sufijo) mediante cabezas de afijos.
- Condicionamiento explicito sobre el historial de roots y sobre el estado del operador de Sībawayh.
- Modelado de roots equivalentes por permutacion (consistencia de orbita sobre pares S³).
- Decodificacion restringida por gramatica (tag `grammar-constrained-decoding`).
- Generacion de texto en arabe e ingles (pipeline text-generation).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion en morfologia arabe clasica: el modelo permite estudiar la prediccion de raices y patrones morfologicos con una metrica objetiva (acc@1 sobre contextos novedosos), util para validar hipotesis linguisticas sobre derivacion y transicion de raices.
- Etiquetado morfologico asistido: integrable en pipelines de anotacion donde se necesite proponer la siguiente raiz o la tupla `(wazn, prefix, suffix)` de un texto arabe clasico.
- Decodificacion restringida por gramatica: uso como componente en generadores que requieran respetar reglas morfologicas derivadas de la tradicion grammatical (Basran, andalusi), evitando formas invalidas.
- Analisis de corpus historicos: procesamiento de textos arabes clasicos para extraer la secuencia de raices y apoyar estudios de lexicografia o edicion critica.
- Comparacion metodologica: sirve como referencia reproducible para investigar si una arquitectura dedicada supera a un control emparejado y a un n-grama, dado que la propia model card publica la ablacion.
- Docencia y experimentacion: por su tamano reducido (repositorio de 0,1 GB) y licencia Apache 2.0, es adecuado para practicas de ajuste y evaluacion de cabezas morfologicas en entornos academicos.
- Auditoria de contaminacion de benchmarks: el repositorio documenta un caso de contaminacion (`BENCHMARK_CONTAMINATION.md`) que puede usarse como material didactico sobre evaluacion de modelos.

## Benchmarks y rendimiento

La model card publica una ablacion con acc@1 del siguiente root sobre el flujo held-out a nivel de fichero, tanto en todas las posiciones (ALL) como en contextos novedosos (NOVEL, el 77,9 % de las posiciones de validacion). Los datos son los siguientes:

| Step | Control (h-only) ALL / NOVEL | NRMT completo ALL / NOVEL |
|---|---|---|
| 2000 | 5,83 / 5,67 | 6,60 / 6,38 |
| 6000 | 6,53 / 6,39 | 7,17 / 6,90 |
| 12000 | 6,85 / 6,65 | 7,40 / 7,08 |
| 16000 | plateau | 7,43 / 7,12 |
| 20000 | plateau | 7,57 / 7,25 |

Datos adicionales declarados: perdida de root en entrenamiento a 20 k steps de 4,13 (NRMT) frente a 5,12 (control); PPL peor para el modelo completo (1296 frente a 808), que aumenta con la norma de las caracteristicas (0 a 39,5); y un n-grama interpolado basado en conteo que supera a ambos en contextos novedosos (12,1 % frente a 7,25 %). La model card advierte de que la ganancia de la arquitectura es real pero modesta (+0,5 a +0,8 pp), y recomienda usar metricas de rango (acc@1/@5) en lugar de PPL. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- El repositorio ocupa 0,1 GB, pero corresponde a las cabezas NRMT sobre el backbone de v20; el recuento de parametros del backbone no esta publicado, por lo que la VRAM exacta no esta disponible.
- Por el tamano del checkpoint, la inferencia cabe con holgura en GPUs de consumo (por ejemplo, RTX 3060/4090), aunque no se puede confirmar la VRAM minima sin los parametros del backbone.
- GPU recomendadas: no disponibles de forma especifica; cualquier GPU con al menos unos pocos GB de VRAM deberia ser suficiente dado el tamano del artefacto.
- Opciones de despliegue: la libreria declarada es transformers; no se documentan soportes de vLLM, llama.cpp, Ollama ni TGI, ni formatos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos abiertos comparables con la misma tarea (prediccion del siguiente root morfologico en arabe clasico). La unica referencia directa es el checkpoint predecesor del mismo autor:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| enver/rootformer-v20.1-nrmt | no disponible | no disponible | acc@1 7,25 % (NOVEL, 20 k steps) | Apache 2.0 | HuggingFace |
| enver/rootformer-v20 | no disponible | no disponible | backbone sin las cabezas NRMT | no disponible | HuggingFace |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

Para el resto de alternativas de la misma categoria: no disponible.

## Limitaciones y advertencias

- La ganancia de la nueva arquitectura es modesta (+0,5 a +0,8 pp de acc@1) y la propia model card la califica como no transformadora.
- La PPL del modelo completo es peor que la del control (1296 frente a 808) y aumenta con la norma de las caracteristicas; es sobreconfiado y requiere label smoothing o temperatura antes de fiarse de sus probabilidades.
- Un n-grama interpolado por conteo supera al modelo en contextos novedosos (12,1 % frente a 7,25 %), lo que indica que la cabeza aprendida extrae menos estructura de transicion que una tabla de consulta.
- No estan implementados: la pila de valencia y constituyentes de Sībawayh (*Inqiṭāʿ al-ʿAmal*), la saturacion clitica *al-Iktifāʾ*, el apocope yusivo completo en la realizacion superficial ni *Marātib al-Maʿārif* en tiempo de decodificacion.
- Aviso de correccion: la "transmutacion" de v19.2 era un diccionario codificado a mano con expresiones regulares, no salida del modelo; la puntuacion LaBSE de 0,9037 en Grand-100 es memorizacion, no traduccion (las 100 frases arabes y las 100 inglesas aparecen textualmente en los corpus de entrenamiento).
- Un corpus bilingue esta emparejado aleatoriamente: la auditoria de acuerdo MT da +4,7 para `grand_scholastic_bilingual` (practicamente aleatorio), mientras que `pure_gold` (+17), `sovereign_classical_transmute` (+21) y `unified_basran_andalusian` (+20) si estan alineados. Los conjuntos `mujtahid_*` y `grand_scholastic_train` son solo en arabe (100 % de ingles vacio).
- Los conjuntos de datos y checks de algoritmos clasicos han requerido correcciones (diez de veinte comprobaciones fallaron contra los textos primarios).
- Sesgos conocidos: no documentados de forma explicita en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, aunque la evaluacion sugiere sobreconfianza.
- Restricciones de licencia: Apache 2.0, permite uso comercial; no se documentan restricciones adicionales.
- Uso en produccion: el modelo esta orientado a investigacion en morfologia; su baja acc@1 absoluta (7,25 % en contextos novedosos) lo hace inadecuado como componente autonomo de generacion sin restricciones gramaticales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enver/rootformer-v20.1-nrmt
- Backbone predecesor v20: https://huggingface.co/enver/rootformer-v20
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
