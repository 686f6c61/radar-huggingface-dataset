# ast-atp/Tonsil_to_MCL

## Resumen

Tonsil_to_MCL es un repositorio de artefactos cientificos, no un modelo de lenguaje. Lo publica el autor ast-atp en Hugging Face como complemento de un estudio sobre el rewireado regulatorio en el linfoma de celulas del manto (MCL, mantle cell lymphoma). El repositorio contiene tablas agregadas de accesibilidad de cromatina y expresion genica, superficies proteicas preparadas para diseno de binders y las salidas crudas de un pipeline de co-plegamiento y diseno de proteinas. No incluye pesos de ningun modelo neuronal.

El problema que aborda el estudio es metodologico: la mayoria de estudios de MCL comparan celulas tumorales con celulas B normales sin emparejar por estado de diferenciacion, lo que confunde desarrollo con cancer. Este trabajo compara cada celula tumoral con la celula B de tonsila normal en el mismo estadio de desarrollo. El hallazgo principal es un sitio de DNA de siete letras, `TGACTCA`, sitio de union de AP-1 y Maf pequenos, que conduce a la via cistina/glutation/defensa contra ferroptosis a traves de `SLC7A11`.

El repositorio tiene 0,2 GB y se distribuye con licencia CC-BY-4.0. Es relevante para investigadores en genomica de celula unica, biologia del cancer y diseno computacional de proteinas que quieran verificar los numeros del estudio sin reejecutar el pipeline completo. El codigo, los metodos y el informe completo estan en un repositorio GitHub separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de datos y predicciones, no un modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible; el repositorio contiene `.csv`, `.csv.gz`, `.pdb`, `.cif`, `.npz`, `.json` y `.yaml` |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay un modelo entrenado con pesos publicados. El repositorio agrupa las salidas de un pipeline computacional que combina varias herramientas. Por un lado, Boltz-2 para co-plegamiento de proteinas y calculo de matrices de error predicho (`pae_*.npz`, `pde_*.npz`) y resumenes de confianza (`confidence_*.json`). Por otro, RFdiffusion3 y ProteinMPNN para el diseno de mini-proteinas y la asignacion de secuencias. El pipeline consta de 15 pasos y genera 2.061 archivos en la carpeta `predictions/`.

Los datos genomicos subyacentes son multiome de celula unica (ATAC y expresion) de dos pacientes con MCL y de tonsila normal. La carpeta `tables/` incluye tablas agregadas por pico de cromatina (215.204 picos en `22_atac_diff.csv` y `26_peak_annotated.csv`), pseudobulk por pico y pseudobulk por estado de diferenciacion normal (47 estados en `15_normal_state_pseudobulk.csv`). Las tablas por celula, las llamadas de variantes por paciente y los datos crudos no se publican en ningun repositorio.

Como innovacion metodologica destaca el emparejamiento por estado de diferenciacion y el control de fondo emparejado por longitud y contenido de GC. Sin ese emparejamiento, 503 motivos parecen significativos; con el, solo 25. Tambien se retuvo un subconjunto del dataset de interfaces proteicas PIONEER2 porque su servidor web no declara licencia en ninguna pagina (comprobado el 2026-11-22), por lo que queda bajo todos los derechos reservados; el script `scripts/95_pioneer2.py` permite reconstruirlo desde la fuente original.

## Capacidades

- Verificacion de resultados genomicos: las tablas permiten recalcular diferencias de accesibilidad, anotaciones de picos y pseudobulk por estado de diferenciacion.
- Recalculo de metricas de interfaz proteica: a partir de las matrices `.npz` y los `.cif` se pueden recomputar ipSAE, ipTM, pDockQ, pDockQ2 y LIS.
- Inspeccion de superficies diana preparadas: `mafg_target.pdb` (derivada de la entrada PDB 7X5E), `fsp1_target.pdb` (de 8YOQ) y `fsp1_template_renumbered.pdb` con residuos renumerados desde 1 y registros `SEQRES` anadidos.
- Reproduccion del pipeline de co-plegamiento y diseno: 15 pasos documentados en el repositorio de codigo, con salidas organizadas por numero de paso.
- Analisis de dependencias selectivas: los datos soportan la comparacion con DepMap para genes de la via (`SLC7A11` z = -2,89, `GCLM` -2,74, `AIFM2` -2,60, `SLC3A2` -2,18, `GCLC` -1,65).
- No ofrece generacion de texto, razonamiento, codigo, tool calling ni capacidades de agente.

## Casos de uso

- Verificacion independiente de estudios de rewireado regulatorio: un investigador puede descargar `22_atac_diff.csv` y `26_peak_annotated.csv` para comprobar el enriquecimiento de `TGACTCA` (AP-1 1,28-1,42x, BACH1 1,38x) contra un fondo emparejado por longitud y GC, sin reejecutar el pipeline de celula unica.
- Analisis de accesibilidad diferencial por estado de diferenciacion: `15_normal_state_pseudobulk.csv` permite reconstruir la expectativa de expresion en los 47 estados normales y contrastarla con las muestras tumorales, como en el caso de `SLC7A11` (esperado 0,001 frente a medido 0,206).
- Diseno y evaluacion de binders contra MafG: las superficies `mafg_target.pdb` y las salidas de RFdiffusion3/ProteinMPNN permiten reanalizar la mini-proteina de 90 residuos que supera al socio nativo NRF2 en tres de cuatro metricas.
- Recalculo de metricas de confianza de co-plegamiento: los archivos `pae_*.npz` y `confidence_*.json` permiten recomputar ipTM e ipSAE para auditar las predicciones de interfaz.
- Estudio de la via cistina/glutation/ferroptosis en linfoma: las tablas soportan el analisis de los cinco elementos regulatorios de `SLC7A11` ausentes en celulas B normales y su estado de metilacion (0,21 en celulas B normales frente a 0,67 en picos vecinos y 0,90 de fondo genomico).
- Docencia y formacion en genomica computacional: el repositorio sirve como caso practico de emparejamiento por estado de diferenciacion y de control de fondo en analisis de motivos.
- Auditoria de licencias en datasets de biologia estructural: la retencion documentada de PIONEER2 y las notas en `docs/TOOLING_NOTES.md` sirven de ejemplo de gestion de licencias ambiguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica inferencia de modelo: el repositorio no contiene pesos ni requiere GPU para consultarse.
- Almacenamiento: 0,2 GB en total (110 MB de tablas, 0,6 MB de estructuras y 149 MB de predicciones).
- Para recalcular metricas de interfaz a partir de los `.npz` y `.cif` no se necesita GPU; basta con CPU y las librerias de analisis estructural correspondientes.
- Para reejecutar el pipeline completo (Boltz-2, RFdiffusion3, ProteinMPNN) se requiere GPU, aunque la informacion disponible no especifica modelo ni VRAM.
- Opciones de despliegue: descarga directa desde Hugging Face o clonado del repositorio de codigo en GitHub.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada repositorios comparables de la misma categoria.

## Limitaciones y advertencias

- Solo dos pacientes: no existe un tercer multiome de MCL derivado de paciente en datos publicos, lo que limita la generalizacion.
- Predicciones, no mediciones: todas las estructuras son modelos; no hay afinidad de union medida, estructura cristalografica ni ensayo celular.
- Asimetria de evidencia: la afirmacion sobre el elemento de `SLC7A11` tiene evidencia interna limpia y dos apoyos externos independientes; la afirmacion de que MafG es el nodo farmacologicamente atacable es mas debil, ya que su senal de contacto se retracto tras explicarse por accesibilidad de picos y su acoplamiento ganado fallo dos tests de cromatina.
- El informe del estudio lista 22 hipotesis probadas y rechazadas, incluyendo varios errores de los propios autores; conviene leer esa seccion antes de construir sobre cualquier hallazgo.
- No se publican tablas por celula, llamadas de variantes por paciente ni datos crudos, lo que impide reproducciones de nivel celular.
- El subconjunto de PIONEER2 no se republica por falta de licencia declarada; quien lo necesite debe reconstruirlo desde la fuente original.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero no cubre los datos de terceros retenidos ni las estructuras derivadas de entradas PDB, cuyas condiciones propias deben respetarse.
- Idioma de la documentacion: solo en ingles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ast-atp/Tonsil_to_MCL
- Repositorio de codigo, metodos e informe completo: https://github.com/astcgt/Tonsil_to_MCL
- Entrada PDB de MafG (7X5E): https://www.rcsb.org/structure/7X5E
- Entrada PDB de FSP1 (8YOQ): https://www.rcsb.org/structure/8YOQ
