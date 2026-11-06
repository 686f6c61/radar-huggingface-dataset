# jesusvilela/manifoldgl-cp3000

## Resumen

ManifoldGL cp3000 es un artefacto de investigación publicado en Hugging Face por el usuario jesusvilela bajo el identificador `jesusvilela/manifoldgl-cp3000`. No se trata de un modelo de lenguaje completo ni de un adaptador PEFT/LoRA al uso, sino de un estado de pesos personalizado para un componente denominado `GeometricIGBundleAdapter`, implementado en PyTorch dentro del proyecto IGBundle-LLM. El repositorio ocupa 0,1 GB y contiene un unico fichero de pesos (`adapter_weights.pt`, 58.741.417 bytes) junto con metadatos de configuracion.

La propia model card, actualizada el 2 de noviembre de 2026, corrige afirmaciones de una version anterior: retira metricas de rendimiento (28,7 % frente a 12,4 % en ARC-AGI, "MFR 94,2 %", hiperbolicidad aprendida y supuestas ganancias de eficiencia), reconoce que la identidad exacta del modelo base esta sin resolver (la configuracion apunta a `Qwen/Qwen2.5-7B-Instruct`, mientras que la tarjeta previa citaba `Qwen/Qwen2.5-7B` y una linea de merge local cp600) y advierte de que no se proporciona un cargador validado de extremo a extremo. El artefacto se etiqueta como `research-artifact` e `historical-checkpoint`.

Por tanto, su relevancia actual es documental y metodologica: ilustra un caso de correccion publica de resultados no verificados y establece un perimetro explicito de lo que el objeto publicado permite y no permite afirmar. No debe evaluarse como un modelo desplegable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador geometrico personalizado (`GeometricIGBundleAdapter`) sobre un transformer base no confirmado; metadatos de atencion geodesica, dinamica y meta-cognicion |
| Parametros totales | No disponible (el fichero de pesos ocupa 58.741.417 bytes; el numero de parametros no se declara) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en `adapter_weights.pt`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`adapter_weights.pt`, state dict serializado con pickle) |

Datos adicionales declarados en `adapter_config.json`: anchura oculta 3584, dimension latente 64, 8 componentes, 16 categorias, modalidades de vision y texto.

## Arquitectura y entrenamiento

El objeto publicado es un state dict de PyTorch para un adaptador de arquitectura propia, no un transformer completo. La configuracion describe una anchura oculta de 3584, una dimension latente de 64, 8 componentes y 16 categorias, ademas de modulos de dinamica, atencion geodesica, tratamiento de modalidades de vision y texto, y meta-cognicion. La model card subraya que la presencia de estos campos en la configuracion no demuestra que las rutas correspondientes hayan recibido senal de entrenamiento ni que los pesos se restauren completamente.

El modelo base de referencia no esta resuelto: la configuracion actual nombra `Qwen/Qwen2.5-7B-Instruct`, mientras que la tarjeta anterior citaba `Qwen/Qwen2.5-7B` y una linea de merge local cp600. La referencia de codigo archivada es el commit `579dd7c` de IGBundle-LLM, sin certificacion de compatibilidad con ese snapshot, con `main` actual ni con commits posteriores. No se documentan volumen de tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO. La revision del release indica que las lecturas ZIP remotas acotadas obtuvieron metadatos de pickle, pero el decodificador restringido del proyecto rechazo metadatos de version de modulo no soportados; no se ejecutaron globales de tensor ni se abrieron miembros de almacenamiento de tensor, por lo que no se certifican formas, valores, estado finito ni restauracion de los tensores de cp3000.

## Capacidades

- No se certifica ninguna capacidad funcional del checkpoint publicado: la model card indica explicitamente que no se proporciona un cargador validado de extremo a extremo.
- La configuracion declara rutas de atencion geodesica, dinamica, vision, texto y meta-cognicion, pero su entrenamiento efectivo no esta probado.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): la configuracion menciona modalidades de vision y texto, sin validacion empirica publicada.
- Las cifras historicas de ARC-AGI (28,7 % frente a 12,4 %) y "MFR 94,2 %" quedan retiradas y no deben atribuirse a este objeto.

## Casos de uso

- Auditoria de artefactos de investigacion: usar el repositorio como caso de estudio de correccion publica de resultados no verificados, comparando la tarjeta anterior con la actual y el registro de integridad LFS.
- Verificacion de integridad de releases: comprobar el SHA256 LFS declarado (`b865ffa5...014fd`) y el tamano de `adapter_weights.pt` frente al registro retirado (58.705.739 bytes, SHA256 `20043736...`) para documentar discrepancias en pipelines de curaduria de modelos.
- Reproducibilidad de algebra: ejecutar `kappa_invariance_test.py`, que valida la cancelacion del log-determinante en coordenadas fijas sobre matrices sinteticas con aserciones explicitas, sin cargar el checkpoint ni importar el codigo geometrico archivado.
- Archivado historico: conservar el estado cp3000 como referencia de una linea de investigacion sobre adaptadores geometricos, etiquetado como `historical-checkpoint` y sin uso previsto en inferencia.
- Formacion y revision metodologica: emplear la seccion de correcciones cientificas para explicar la diferencia entre un proxy de log-determinante y un estimador de curvatura seccional, y por que el clamping del log-determinante puede romper la cancelacion.
- Diseno de cargadores seguros: tomar las advertencias de la tarjeta (coincidencia exacta de estructura de modulos, claves y formas, carga con `weights_only=True`, comprobacion de cobertura completa, prohibicion de `strict=False`) como especificacion de requisitos para un futuro loader validado.
- Trazabilidad de linaje de modelos: documentar el problema de identidad de base no resuelta (`Qwen2.5-7B-Instruct` frente a `Qwen2.5-7B` y merge cp600) como ejemplo de buenas practicas de fijacion de commits y hashes en releases de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados en la informacion disponible para este checkpoint. Las cifras de ARC-AGI (28,7 % frente a 12,4 %, con un supuesto +131,5 %), "MFR 94,2 %", hiperbolicidad aprendida y eficiencia han sido retiradas expresamente por el autor en la correccion del 2 de noviembre de 2026, y las cifras historicas de ARC no establecen el rendimiento de este checkpoint exacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto no es un modelo autonomo y no existe un procedimiento de carga validado.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable sin identidad de base resuelta ni loader certificado.
- Opciones de despliegue: no disponible. No es compatible con `PeftModel.from_pretrained`, vLLM, llama.cpp, Ollama ni TGI en su forma publicada; requiere la estructura de modulos original de IGBundle-LLM y coincidencia exacta de claves y formas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado de validacion |
|---|---|---|---|---|---|
| ManifoldGL cp3000 | Adaptador geometrico personalizado (state dict PyTorch) | No disponible | No disponible | Apache 2.0 | Sin loader validado; capacidades no certificadas |
| Qwen2.5-7B-Instruct | LLM transformer completo | 7 600 millones (aprox.) | 32 768 tokens (declarado por el autor del base) | Apache 2.0 | Modelo desplegable y ampliamente evaluado |
| Adaptadores PEFT/LoRA estandar | Adaptador de bajo rango | Depende de r y modulos | Hereda del base | Segun autor | Carga directa con `PeftModel.from_pretrained` |

La comparacion es estructural, no de rendimiento: cp3000 no es intercambiable con un adaptador PEFT ni con el checkpoint por defecto actual de IGBundle, y su base exacta esta sin resolver. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- La identidad exacta del modelo base esta sin resolver: la configuracion cita `Qwen/Qwen2.5-7B-Instruct`, la tarjeta previa citaba `Qwen/Qwen2.5-7B` y un merge local cp600. No debe elegirse una base a partir de ninguna de las dos afirmaciones historicas.
- No se proporciona un cargador validado de extremo a extremo; el snippet anterior envolvia un modelo pero nunca copiaba el estado, y ha sido retirado.
- La revision no certifica formas, valores, estado finito ni restauracion de los tensores de cp3000; el decodificador restringido rechazo metadatos de version de modulo no soportados.
- Las metricas retiradas (ARC-AGI 28,7 % frente a 12,4 %, +131,5 %, "MFR 94,2 %", hiperbolicidad aprendida, eficiencia) no deben citarse como resultados de este objeto.
- El proxy de log-determinante no es un estimador general de curvatura seccional; la invariancia de pesos del proxy no implica que la metrica sea plana o cercana a la identidad, y el clamping puede romper la cancelacion.
- Las preocupaciones a nivel de codigo sobre dinamicas desconectadas no prueban el historial de gradientes de este checkpoint sin un vinculo inmutable entre ejecucion y codigo fuente.
- Compatibilidad con el commit archivado `579dd7c`, con `main` actual o con commits posteriores no esta certificada.
- Riesgo de seguridad al cargar: debe usarse `weights_only=True` con estado de confianza, verificando cobertura completa; nunca ocultar incompatibilidades con `strict=False` ni dejar modulos faltantes inicializados aleatoriamente.
- No se establece ni un beneficio general ni una ineficacia general de los adaptadores geometricos.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su falta de validacion funcional hace inadecuado cualquier uso en produccion.
- Sesgos conocidos y riesgo de alucinacion: no evaluables, al no existir inferencia validada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jesusvilela/manifoldgl-cp3000
- Aviso de correccion: https://github.com/jesusvilela/IGBundle-LLM/blob/main/docs/correction-notice.md
- Registro de evidencia investigacion-codigo: https://github.com/jesusvilela/IGBundle-LLM/blob/main/docs/research_to_code_evidence_ledger.md
- Proyecto IGBundle-LLM: https://github.com/jesusvilela/IGBundle-LLM
- Modelo base citado en la configuracion: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base citado en la tarjeta previa: https://huggingface.co/Qwen/Qwen2.5-7B
